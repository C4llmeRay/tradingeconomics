import CompanyCompare from "./components/CompanyCompare";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title
);

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <CompanyCompare />
      </header>
    </div>
  );
}

export default App;
