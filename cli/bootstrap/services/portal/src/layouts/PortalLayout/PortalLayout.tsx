import { Outlet } from "react-router-dom";
import gnarEngineLogo from '../../assets/gnar-engine-white-logo.svg';
import Topbar from "../../components/Topbar/Topbar";
import Sidebar from "../../components/Sidebar/Sidebar";

function PortalLayout() {

    return (
        <>
            <Topbar />
            <div className="portal-main">
                <div className="portal-main-inner flex-row">
                    <Sidebar />
                    <div className="portal-page">
                        <div className="portal-page-header">
                            <img src={gnarEngineLogo} className="logo" alt="Gnar Engine" />
                        </div>
                        <Outlet />
                        <div className="portal-page-footer">
                            <p>©2025 Gnar Engine. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PortalLayout;
