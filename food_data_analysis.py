import pandas as pd
import glob
import os
import json

# Function to load and merge all CSV files
def load_and_merge_csvs(file_pattern="dataset/FOOD-DATA-GROUP*.csv"):
    csv_files = glob.glob(file_pattern)
    if not csv_files:
        raise FileNotFoundError("No CSV files found matching the pattern.")
    
    df_list = [pd.read_csv(file) for file in csv_files]
    merged_df = pd.concat(df_list, ignore_index=True)
    return merged_df

# Function to clean the dataset
def clean_dataset(df):
    if 'Unnamed: 0' in df.columns:
        df = df.drop(columns=['Unnamed: 0'])
    
    numerical_cols = df.select_dtypes(include=['float64', 'int64']).columns
    df[numerical_cols] = df[numerical_cols].fillna(0)
    
    df['food'] = df['food'].astype(str).str.strip()
    return df

# Function to perform comprehensive analyses
def analyze_dataset(df):
    analyses = {}

    # 1. Summary Statistics
    analyses['summary_stats'] = df.describe().to_dict()

    # 2. Top 5 Foods by Key Nutrients
    nutrients = ['Caloric Value', 'Fat', 'Protein', 'Carbohydrates', 'Nutrition Density']
    analyses['top_foods'] = {}
    for nutrient in nutrients:
        top_foods = df[['food', nutrient]].sort_values(by=nutrient, ascending=False).head(5).to_dict(orient='records')
        analyses['top_foods'][nutrient] = top_foods

    # 3. Average Nutrient Values by Food
    analyses['avg_nutrients'] = df.groupby('food')[nutrients].mean().reset_index().to_dict(orient='records')

    # 4. Correlation Matrix for Nutrients
    analyses['correlation_matrix'] = df[nutrients].corr().to_dict()

    # 5. High Nutrient Foods (above median for key nutrients)
    median_values = df[nutrients].median()
    high_nutrient_foods = df[df[nutrients].gt(median_values, axis=1).all(axis=1)][['food'] + nutrients]
    analyses['high_nutrient_foods'] = high_nutrient_foods.to_dict(orient='records')

    # 6. Food Grouping by Caloric Range
    bins = [0, 100, 200, 300, 500, float('inf')]
    labels = ['Low (<100)', 'Moderate (100-200)', 'High (200-300)', 'Very High (300-500)', 'Extreme (>500)']
    df['Caloric_Range'] = pd.cut(df['Caloric Value'], bins=bins, labels=labels, include_lowest=True)
    caloric_groups = df.groupby('Caloric_Range')[['food', 'Caloric Value']].agg(list).reset_index().to_dict(orient='records')
    analyses['caloric_groups'] = caloric_groups

    return analyses

# Function to save analyses to JSON files
def save_analyses(analyses, output_dir='src/analyses'):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Save main dataset for table display
    df = pd.DataFrame(analyses['avg_nutrients'])
    df.to_json(os.path.join(output_dir, 'food_data.json'), orient='records', indent=2)
    
    # Save other analyses
    with open(os.path.join(output_dir, 'summary_analyses.json'), 'w') as f:
        json.dump({
            'summary_stats': analyses['summary_stats'],
            'top_foods': analyses['top_foods'],
            'correlation_matrix': analyses['correlation_matrix'],
            'high_nutrient_foods': analyses['high_nutrient_foods'],
            'caloric_groups': analyses['caloric_groups']
        }, f, indent=2)

def main():
    try:
        # Load and merge CSV files
        df = load_and_merge_csvs()
        print(f"Loaded {len(df)} records from CSV files.")
        
        # Clean the dataset
        df = clean_dataset(df)
        print("Dataset cleaned.")
        
        # Perform analyses
        analyses = analyze_dataset(df)
        print("Analyses completed.")
        
        # Save results
        save_analyses(analyses)
        print("Analyses saved in 'analyses' directory.")
        
        # Save cleaned dataset to CSV
        df.to_csv('cleaned_food_data.csv', index=False)
        print("Cleaned dataset saved as 'cleaned_food_data.csv'.")
        
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()