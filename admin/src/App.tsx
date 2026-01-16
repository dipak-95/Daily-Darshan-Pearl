import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TemplesPage from './pages/Temples';
import PoonamPage from './pages/Poonam';
import GrahanPage from './pages/Grahan';

export default function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/temples" element={<TemplesPage />} />
                    <Route path="/poonam" element={<PoonamPage />} />
                    <Route path="/grahan" element={<GrahanPage />} />
                    <Route path="*" element={<div>Page Not Found</div>} />
                </Routes>
            </Layout>
        </BrowserRouter>
    )
}
