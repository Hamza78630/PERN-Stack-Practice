import Layout from './components/Layout'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import UserDashboard from './components/UserDashboard'
import AdminDashboard from './components/AdminDashboard'
import Chat from './components/Chat'
import Map from './components/Map'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="userdashboard" element={<UserDashboard />} />
            <Route path="admindashboard" element={<AdminDashboard />} />
            <Route path="chat" element={<Chat />} />
            <Route path="map" element={<Map />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
