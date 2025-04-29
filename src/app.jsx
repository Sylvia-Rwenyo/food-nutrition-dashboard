import { useState, useEffect } from 'react';
import './App.css';

function FoodTable({ data, filter }) {
  const filteredData = data.filter(item =>
    item.food.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">Food</th>
            <th className="py-3 px-6 text-left">Calories (kcal)</th>
            <th className="py-3 px-6 text-left">Fat (g)</th>
            <th className="py-3 px-6 text-left">Protein (g)</th>
            <th className="py-3 px-6 text-left">Carbohydrates (g)</th>
            <th className="py-3 px-6 text-left">Nutrition Density</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {filteredData.map((item, index) => (
            <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
              <td className="py-3 px-6 text-left whitespace-nowrap">{item.food}</td>
              <td className="py-3 px-6 text-left">{item['Caloric Value']}</td>
              <td className="py-3 px-6 text-left">{item.Fat}</td>
              <td className="py-3 px-6 text-left">{item.Protein}</td>
              <td className="py-3 px-6 text-left">{item.Carbohydrates}</td>
              <td className="py-3 px-6 text-left">{item['Nutrition Density']}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SummaryCard({ topFoods, highNutrientFoods }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4">Nutrition Insights</h2>
      {Object.entries(topFoods).map(([nutrient, foods]) => (
        <div key={nutrient} className="mb-4">
          <h3 className="text-lg font-semibold">Top 5 by {nutrient}</h3>
          <ul className="list-disc pl-5">
            {foods.map((food, index) => (
              <li key={index}>{food.food}: {food[nutrient]}</li>
            ))}
          </ul>
        </div>
      ))}
      <div>
        <h3 className="text-lg font-semibold">High Nutrient Foods</h3>
        <p>{highNutrientFoods.length} foods exceed median values for key nutrients.</p>
      </div>
    </div>
  );
}

function CaloricGroups({ caloricGroups }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4">Foods by Caloric Range</h2>
      {caloricGroups.map((group, index) => (
        <div key={index} className="mb-4">
          <h3 className="text-lg font-semibold">{group.Caloric_Range}</h3>
          <p>{group.food.length} foods, e.g., {group.food.slice(0, 3).join(', ')}</p>
        </div>
      ))}
    </div>
  );
}

function App() {
  const [foodData, setFoodData] = useState([]);
  const [analyses, setAnalyses] = useState({});
  const [filter, setFilter] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('./analyses/food_data.json').then(res => res.json()),
      fetch('./analyses/summary_analyses.json').then(res => res.json())
    ])
      .then(([foodData, analyses]) => {
        setFoodData(foodData);
        setAnalyses(analyses);
      })
      .catch(error => {
        console.error('Error loading data:', error);
        setError('Failed to load data. Please try again later.');
      });
  }, []);

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Food Nutrition Dashboard</h1>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Filter by food name..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {foodData.length > 0 && Object.keys(analyses).length > 0 ? (
        <>
          <SummaryCard
            topFoods={analyses.top_foods || {}}
            highNutrientFoods={analyses.high_nutrient_foods || []}
          />
          <CaloricGroups caloricGroups={analyses.caloric_groups || []} />
          <FoodTable data={foodData} filter={filter} />
        </>
      ) : (
        <p className="text-center">Loading data...</p>
      )}
    </div>
  );
}

export default App;