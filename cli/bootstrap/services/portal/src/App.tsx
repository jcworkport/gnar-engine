import { useState } from 'react'
import { Outlet } from "react-router-dom";
//import './style.css'

function App() {
    return  (
        <>
            <h1>YO</h1>
            <Outlet />
        </>
    )
}

export default App
