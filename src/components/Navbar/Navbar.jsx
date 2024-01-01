import React, {useEffect, useState} from 'react';
import defaultAvatar from "../../assets/images/defaultAvatar/defaultAvatar.jpeg";

import {IoMdNotificationsOutline} from 'react-icons/io';
import {fetchUser} from "../../services/User/User";

export default function Navbar() {
    const [user, setUser] = useState({});
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const email = sessionStorage.getItem("userEmail");
        fetchUser(email).then((res) => {
            setUser(res);
        });
    }, []);


    return (
        <div className="navbar grid grid-cols-6 h-full w-full z-0">
            <div className="current-menu w-full h-full col-start-1 col-end-2 flex items-center justify-center ">

            </div>

            {/*<div*/}
            {/*    className="notification w-full h-full col-start-5 col-end-6 flex items-center justify-end"*/}
            {/*    onMouseEnter={() => setShowNotifications(true)}*/}
            {/*    onMouseLeave={() => setShowNotifications(false)}*/}
            {/*>*/}
            {/*    <IoMdNotificationsOutline*/}
            {/*        className='w-5 h-5 cursor-pointer'*/}
            {/*        onClick={() => {*/}
            {/*            alert('notification');*/}
            {/*        }}*/}
            {/*    />*/}
            {/*</div>*/}

            {/*{showNotifications && (*/}
            {/*    <div className="notification-popup">*/}
            {/*        /!* Nội dung hộp thoại thông báo ở đây *!/*/}
            {/*        /!* Ví dụ: *!/*/}
            {/*        <div>Notification 1</div>*/}
            {/*        <div>Notification 2</div>*/}
            {/*    </div>*/}
            {/*)}*/}

            {(user) &&
                (<div className="user w-full h-full col-start-6 col-end-7 flex items-center justify-center">
                        <div className="user-avatar w-14 h-14 border border-black mr-3">
                            <img className="w-full h-full"
                                 src={user.image ? `data:image/jpeg;base64, ${user.image}` : defaultAvatar}
                                 alt="avatar"/>
                        </div>

                        <div className="user-name">
                            {user.name}
                        </div>
                    </div>
                )}
        </div>
    )
}