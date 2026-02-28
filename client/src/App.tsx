import Navbar from './components/Navbar';
import Home from './pages/Home';
import Plans from './pages/Plans';
import SoftBackdrop from './components/SoftBackdrop';
import Footer from './components/Footer';
import LenisScroll from './components/lenis';
import { Routes, Route, Navigate } from 'react-router-dom';
import MyGenerations from './pages/MyGenerations';
import Generator from './pages/Generator';
import Loading from './pages/Loading';
import Results from './pages/Results';
import Community from './pages/Community';
import { Toaster } from 'react-hot-toast';
function App() {
	return (
		<>
			<Toaster toastOptions={{style : {backgroundColor : '#333' , color : '#fff'}}} />
			<SoftBackdrop />
			<LenisScroll />
			<Navbar />
			<Routes>
				{/* legacy support: /result was used earlier, redirect to /results */}
				<Route path="/result/:projectId" element={<Navigate to="/results/:projectId" replace />} />
				<Route path="/" element={<Home />} />
				<Route path="/plans" element={<Plans />} />
				<Route path="/create" element={<Generator />} />
				<Route path="/community" element={<Community />} />
				<Route path="/loading" element={<Loading />} />
				<Route path="/results/:projectId" element={<Results />} />
				<Route path="/my-generations" element={<MyGenerations />} />
			</Routes>
			<Footer />
		</>
	);
}
export default App;