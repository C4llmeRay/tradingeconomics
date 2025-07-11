import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Spinner,
  Table,
} from "react-bootstrap";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const countries = ["mexico", "sweden", "new zealand", "thailand"];
const importanceLevels = [1, 2, 3];

const CompanyCompare: React.FC = () => {
  const [country1, setCountry1] = useState(countries[0]);
  const [country2, setCountry2] = useState(countries[1]);
  const [importance, setImportance] = useState(0);
  const [chartData, setChartData] = useState<any>(null);
  const [companyCounts, setCompanyCounts] = useState<{ [key: string]: number }>(
    {}
  );
  const [companyData, setCompanyData] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(false);

  const api = axios.create({
    baseURL: "https://api.tradingeconomics.com",
    params: {
      c: process.env.REACT_APP_TE_API_KEY,
    },
  });

  const fetchCompanies = async (country: string) => {
    const res = await api.get(
      `/earnings-revenues/country/${encodeURIComponent(country)}`
    );
    const filtered = res.data.filter(
      (item: any) =>
        item.RevenueForecastValue &&
        (!importance || item.Importance === importance)
    );
    return { count: filtered.length, companies: filtered };
  };

  const handleCompare = async () => {
    setLoading(true);
    try {
      const sleep = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      const data1 = await fetchCompanies(country1);
      await sleep(500); // Delay for UX feel
      const data2 = await fetchCompanies(country2);

      setCompanyCounts({
        [country1]: data1.count,
        [country2]: data2.count,
      });

      setCompanyData({
        [country1]: data1.companies,
        [country2]: data2.companies,
      });

      setChartData({
        labels: ["Company Count"],
        datasets: [
          {
            label: country1,
            data: [data1.count],
            backgroundColor: "rgba(54, 162, 235, 0.7)",
          },
          {
            label: country2,
            data: [data2.count],
            backgroundColor: "rgba(75, 192, 192, 0.7)",
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching company data:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderCompanyTable = (country: string) => {
    const companies = companyData[country];
    if (!companies) return null;

    return (
      <div className="mt-4">
        <h4>Companies in {country}</h4>
        <div className="table-responsive">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Company</th>
                <th>Revenue Forecast</th>
                <th>Currency</th>
                <th>Importance</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((item: any) => (
                <tr key={item.Symbol}>
                  <td>{item.Name}</td>
                  <td>
                    {item.RevenueForecastValue.toLocaleString()} {item.Currency}
                  </td>
                  <td>{item.Currency}</td>
                  <td>{item.Importance}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <Container className="py-4">
      <h2 className="text-center mb-4">
        Compare Number of Companies Between Two Countries
      </h2>

      <Row className="g-3 justify-content-center">
        <Col xs={12} sm={6} md={3}>
          <Form.Group controlId="country1">
            <Form.Label>Country 1</Form.Label>
            <Form.Select
              value={country1}
              onChange={(e) => setCountry1(e.target.value)}
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col xs={12} sm={6} md={3}>
          <Form.Group controlId="country2">
            <Form.Label>Country 2</Form.Label>
            <Form.Select
              value={country2}
              onChange={(e) => setCountry2(e.target.value)}
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col xs={12} sm={6} md={3}>
          <Form.Group controlId="importance">
            <Form.Label>Importance</Form.Label>
            <Form.Select
              value={importance}
              onChange={(e) => setImportance(Number(e.target.value))}
            >
              <option value={0}>All</option>
              {importanceLevels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  Importance {lvl}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col xs="auto" className="d-flex align-items-end">
          <Button onClick={handleCompare} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "Compare"}
          </Button>
        </Col>
      </Row>

      {chartData && (
        <div className="mt-5">
          <Bar data={chartData} options={{ responsive: true }} />
        </div>
      )}

      {renderCompanyTable(country1)}
      {renderCompanyTable(country2)}
    </Container>
  );
};

export default CompanyCompare;
