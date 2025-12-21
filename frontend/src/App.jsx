import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Accounts } from './pages/Accounts';
import { Categories } from './pages/Categories';
import { Transactions } from './pages/Transactions';
import { Counterparties } from './pages/Counterparties';
import { Invoices } from './pages/Invoices';
import { ProfitAndLoss } from './pages/ProfitAndLoss';
import { CashFlow } from './pages/CashFlow';
import './App.css';

function App() {
  return (
    <BrowserRouter>

      {/* AuthProvider оборачивает всё приложение */}
      <AuthProvider>
        <Routes>
          {/* Публичный маршрут - login */}
          <Route path="/login" element={<Login />} />

          {/* Публичный маршрут - register */}
          <Route path="/register" element={<Register />} />

          {/* Защищенный маршрут - dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Защищенный маршрут - accounts */}
          <Route
            path="/accounts"
            element={
              <ProtectedRoute>
                <Layout>
                  <Accounts />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Защищенный маршрут - categories */}
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <Layout>
                  <Categories />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Защищенный маршрут - transactions */}
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Layout>
                  <Transactions />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Защищенный маршрут - invoices */}
          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <Layout>
                  <Invoices />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Защищенный маршрут - reports pnl */}
          <Route
            path="/reports/pnl"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfitAndLoss />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Защищенный маршрут - reports cashflow */}
          <Route
            path="/reports/cashflow"
            element={
              <ProtectedRoute>
                <Layout>
                  <CashFlow />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Защищенный маршрут - counterparties */}
          <Route
            path="/counterparties"
            element={
              <ProtectedRoute>
                <Layout>
                  <Counterparties />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* По умолчанию редирект на dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 - редирект на dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>

    </BrowserRouter>
  );
}

export default App;
