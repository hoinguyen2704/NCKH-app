/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import DiseaseSearch from './pages/DiseaseSearch';
import DrugSearch from './pages/DrugSearch';
import DrugRecommendation from './pages/DrugRecommendation';
import DrugDetail from './pages/DrugDetail';
import Visualization from './pages/Visualization';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="diseases" element={<DiseaseSearch />} />
          <Route path="diseases/:id" element={<DrugRecommendation />} />
          <Route path="drugs" element={<DrugSearch />} />
          <Route path="drugs/:id" element={<DrugDetail />} />
          <Route path="visualization" element={<Visualization />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
