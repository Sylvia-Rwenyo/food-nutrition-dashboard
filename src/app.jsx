import { useState, useEffect } from 'react';
import './App.css';

function FoodTable({ data, filter }) {
  const [sortKey, setSortKey] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const filteredData = data
    .filter(item => item.food.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      if (!sortKey) return 0;
      const valA = parseFloat(a[sortKey]) || 0;
      const valB = parseFloat(b[sortKey]) || 0;
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

  const sortIndicator = (key) =>
    sortKey === key ? (sortOrder === 'asc' ? ' ↓' : ' ↑') : '';

  return (
      <div className="w-full h-full overflow-auto">
        <table className="min-w-full border border-green-200 text-left text-sm">
          <thead className="bg-green-50 text-green-800 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('food')}>
                Food{sortIndicator('food')}
              </th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('Caloric Value')}>
                Calories{sortIndicator('Caloric Value')}
              </th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('Fat')}>
                Fat (g){sortIndicator('Fat')}
              </th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('Protein')}>
                Protein (g){sortIndicator('Protein')}
              </th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('Carbohydrates')}>
                Carbs (g){sortIndicator('Carbohydrates')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-green-100">
            {filteredData.map((item, index) => (
              <tr key={index} className="hover:bg-green-50">
                <td className="py-3 px-4">{item.food}</td>
                <td className="py-3 px-4">{item['Caloric Value']}</td>
                <td className="py-3 px-4">{item.Fat}</td>
                <td className="py-3 px-4">{item.Protein}</td>
                <td className="py-3 px-4">{item.Carbohydrates}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
    <div className="text-center" id="root">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-green-700">Nutripedia</h1>
        <p className="text-gray-600 mt-2">A nutrition reference catalogue</p>
      </header>

      <div className="mb-8">
        <input
          type="text"
          placeholder="Search for a food..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full md:w-1/2 mx-auto block p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {foodData.length > 0 ? (
        <>
          <FoodTable data={foodData} filter={filter} />
        </>
      ) : (
        <p className="text-gray-500 text-center">Loading data...</p>
      )}
    </div>
  );
}

export default App;
