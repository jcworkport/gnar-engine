import { Link } from "react-router-dom";

function LoginForm() {

    return (
        <form className="login-form">
            <input type="text" name="username" placeholder="username / email" className="username" />
            <input type="password" name="password" placeholder="password" className="password" />
            <button type="submit">Login</button>
            <Link to="/portal/forgotten-password" className="text-link forgotten-password">Forgotten Password?</Link>
        </form>
    )
}

export default LoginForm;
