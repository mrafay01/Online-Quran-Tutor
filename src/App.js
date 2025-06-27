import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import './App.css';

import HomePage from "./Pages/home";
import LoginSignup from './Pages/loginsignup';
import Courses from './Pages/Courses';
import Teachers from './Pages/Teachers';
import AboutUs from './Pages/About-Us';
import ContactUs from './Pages/Contact-Us'
import Schedule from './Pages/Schedule';
import Slots from './Components/DashboardComponents/shared/slots'
import Profile from './Components/DashboardComponents/shared/Profile';
import MyCoursesPage from './Components/DashboardComponents/my-courses';
import Setting from './Components/DashboardComponents/shared/Settings'
import SchedulePage from './Components/DashboardComponents/shared/schedule';
import NotificationsPage from './Components/DashboardComponents/notifications';
import TeacherExtra from './Components/TeacherExtra';
import ParentDashboard from './Components/DashboardComponents/Parent/ParentDashboard';
import MyChildren from './Components/DashboardComponents/Parent/MyChildren';
import ParentPayments from './Components/DashboardComponents/Parent/ParentPayments';
import ChildrenProgress from './Components/DashboardComponents/Parent/ChildrenProgress';
import StudentDashboard from './Components/DashboardComponents/Student/StudentDashboard';
import StudentCourses from './Components/DashboardComponents/Student/StudentCourses';
import StudentProgress from './Components/DashboardComponents/Student/StudentProgress';
import TeacherDashboard from './Components/DashboardComponents/Teacher/TeacherDashboard';
import MyStudents from './Components/DashboardComponents/Teacher/MyStudents';
import TeacherCourses from './Components/DashboardComponents/Teacher/TeacherCourses';
import TeacherEarnings from './Components/DashboardComponents/Teacher/TeacherEarnings';
import EnrollTeacher from './Components/DashboardComponents/Student/EnrollTeacher';
import TeacherDetail from './Components/DashboardComponents/Student/TeacherDetail';
import CourseProgressDetail from './Components/DashboardComponents/Student/CourseProgressDetail';

function DashboardRouter() {
  const { role } = useParams();
  if (role === 'student') return <StudentDashboard />;
  if (role === 'teacher') return <TeacherDashboard />;
  if (role === 'parent') return <ParentDashboard />;
  return <div>Invalid role</div>;
}

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
        <Route path="/teacher-extra" element={<TeacherExtra />} />
        <Route path='/:role/:username/profile' element={<Profile/>}/>
        <Route path='/:role/:username/dashboard' element={<DashboardRouter />} />
        <Route path='/:role/:username/my-courses' element={<MyCoursesPage/>}/>
        <Route path='/:role/:username/setting' element={<Setting/>}/>
        <Route path='/:role/:username/schedule' element={<SchedulePage/>}/>
        <Route path='/:role/:username/notifications' element={<NotificationsPage/>}/>
        <Route path='parent/:username/dashboard' element={<ParentDashboard />} />
        <Route path='parent/:username/my-children' element={<MyChildren />} />
        <Route path='parent/:username/payments' element={<ParentPayments />} />
        <Route path='parent/:username/children-progress' element={<ChildrenProgress />} />
        <Route path='student/:username/dashboard' element={<StudentDashboard />} />
        <Route path='student/:username/courses' element={<StudentCourses />} />
        <Route path='student/:username/progress' element={<StudentProgress />} />
        <Route path='student/:username/progress/:courseId' element={<CourseProgressDetail />} />
        <Route path='teacher/:username/dashboard' element={<TeacherDashboard />} />
        <Route path='teacher/:username/my-students' element={<MyStudents />} />
        <Route path='teacher/:username/courses' element={<TeacherCourses />} />
        <Route path='teacher/:username/earnings' element={<TeacherEarnings />} />
        <Route path="/student/:student_username/enroll-teacher" element={<EnrollTeacher />} />
        <Route path="/student/:student_username/teacher/:teacher_username" element={<TeacherDetail />} />
        <Route path='/:role/:username/slots' element={<Slots/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;