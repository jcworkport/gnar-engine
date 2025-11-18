import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getGravatarUrl } from "../../services/gravatar";

function UserInfo() {

    const { authUser } = useSelector((state: any) => state.auth);
    const [loading, setLoading] = useState(true);
    const [gravatarUrl, setGravatarUrl] = useState('');

    useEffect(() => {

        if (authUser && authUser.email) {
            const gravatar = getGravatarUrl(authUser.email, { size: 100 });
            setGravatarUrl(gravatar);
            setLoading(false);
        }

    }, [authUser])

    return (
        <div className="user-info">
            {authUser && !loading && (
                <div className="user-info-mini flex-row">
                    {gravatarUrl && (
                        <img src={gravatarUrl} alt="User Gravatar" className="gravatar-image" />
                    )}
                    <span className="email">{authUser.email}</span>
                </div>
            )}
        </div>
    )
}

export default UserInfo;
