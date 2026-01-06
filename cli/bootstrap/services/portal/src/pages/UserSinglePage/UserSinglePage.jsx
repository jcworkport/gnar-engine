import { useState, useEffect, use } from 'react';
import { useParams } from 'react-router-dom';
import { user } from '../../services/user.js';


function UserSinglePage() {
    const [userData, setUserData] = useState(null);
    const { id: userId } = useParams();

    useEffect(() => {
        (async () => {
            const data = await user.getUser({ userId })
            setUserData(data);
        })()
    }, [userId]);

    console.log('USER DATA:', userData);


    return (
        <div>User Single Page</div>
    )
}

export default UserSinglePage;
