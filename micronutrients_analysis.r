library(dplyr)
library(tidyr)
library(ggplot2)
library(corrplot)
library(skimr)

# Load and clean data
df <- read.csv("cleaned_food_data.csv")
names(df) <- trimws(names(df)) # remove any whitespace
names(df) <- gsub("\\.+", " ", names(df)) # replace dots with spaces

# Micronutrient columns
micros <- c(
  "Sodium", "Vitamin A", "Vitamin B1", "Vitamin B11", "Vitamin B12",
  "Vitamin B2", "Vitamin B3", "Vitamin B5", "Vitamin B6", "Vitamin C",
  "Vitamin D", "Vitamin E", "Vitamin K", "Calcium", "Copper", "Iron",
  "Magnesium", "Manganese", "Phosphorus", "Potassium", "Selenium", "Zinc"
)

# Transform to long format
df_long <- df %>%
  pivot_longer(cols = all_of(micros), names_to = "micronutrient", values_to = "amount") %>%
  mutate(
    amount_display = case_when(
      amount == 0 ~ NA_character_,
      amount < 0.01 ~ "trace amounts",
      TRUE ~ as.character(amount)
    )
  ) %>%
  filter(!is.na(amount_display))

# Descriptive stats
summary_stats <- df_long %>%
  group_by(micronutrient) %>%
  summarise(
    mean = mean(as.numeric(amount), na.rm = TRUE),
    median = median(as.numeric(amount), na.rm = TRUE),
    min = min(as.numeric(amount), na.rm = TRUE),
    max = max(as.numeric(amount), na.rm = TRUE)
  )

print(summary_stats)
skim(df_long)

# Barplot
ggplot(df_long, aes(x = food, y = as.numeric(amount), fill = micronutrient)) +
  geom_bar(stat = "identity", position = "dodge") +
  labs(title = "Micronutrient Content per Food") +
  theme(axis.text.x = element_text(angle = 90, hjust = 1))

# Correlation Plot
micros_df <- df %>% select(all_of(micros))
corrplot(cor(micros_df, use = "pairwise.complete.obs"), method = "circle")

# PCA
pca <- prcomp(micros_df, scale. = TRUE)
biplot(pca)

# K-means Clustering
set.seed(123)
clusters <- kmeans(micros_df, centers = 3)
df$cluster <- clusters$cluster

# Linear Model
lm_fit <- lm(Iron ~ Calcium + `Vitamin C`, data = df)
summary(lm_fit)

# Export long-form data
write.csv(df_long, "src/analyses/food_nutrients_long.csv", row.names = FALSE)
