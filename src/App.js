import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import HomePage from "./Pages/home";
import LoginSignup from './Pages/loginsignup';
import Courses from './Pages/Courses';
import Teachers from './Pages/Teachers';
import AboutUs from './Pages/About-Us';
import ContactUs from './Pages/Contact-Us'
import Schedule from './Pages/Schedule';
import Profile from './Pages/Profile';
import Dashboard from './Components/DashboardComponents/dashboard';
import MyCoursesPage from './Components/DashboardComponents/my-courses';
import Setting from './Components/DashboardComponents/settings'
import ProgressPage from './Components/DashboardComponents/progress';
import SchedulePage from './Components/DashboardComponents/schedule';
import NotificationsPage from './Components/DashboardComponents/notifications';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<HomePage />}/>
        <Route path='/home' element={<HomePage/>}/>
        <Route path='/loginsignup' element={<LoginSignup/>}/>
        <Route path='/courses' element={<Courses/>}/>
        <Route path='/teachers' element={<Teachers/>}/>
        <Route path='/about-us' element={<AboutUs/>}/> 
        <Route path='/contact-us' element={<ContactUs/>}/>
        <Route path='/schedule' element={<Schedule/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/:username/dashboard' element={<Dashboard/>}/>
        <Route path='/:username/my-courses' element={<MyCoursesPage/>}/>
        <Route path='/:username/setting' element={<Setting/>}/>
        <Route path='/:username/progress' element={<ProgressPage/>}/>
        <Route path='/:username/schedule' element={<SchedulePage/>}/>
        <Route path='/:username/notifications' element={<NotificationsPage/>}/>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;