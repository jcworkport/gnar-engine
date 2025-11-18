import UserInfo from "../UserInfo/UserInfo";

function Sidebar() {

    return (
        <div className="portal-sidebar">
            <div className="inner">
                <ul>
                    <li className="icon-dashboard">Dashboard</li>
                </ul>
                <span className="separator"></span>
                <ul>
                    <li className="icon-users">Users</li>
                </ul>
                <span className="separator"></span>
                <ul>
                    <li className="icon-reports">Reports</li>
                    <li>Logs</li>
                </ul>
            </div>

            <UserInfo />
        </div>
    )
}

export default Sidebar;
