import { useEffect, useState } from "react";
import axios from "axios";

import "./UserManagement.css";

const UserManagement = () => {

    const [users, setUsers] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        fetchUsers();

    }, []);

    const fetchUsers = async () => {

        try{

            const token = localStorage.getItem("token");

            const { data } = await axios.get(

                "https://onlinefooddelivery-9g60.onrender.com/api/admin/users",

                {

                    headers:{

                        Authorization:`Bearer ${token}`

                    }

                }

            );

            setUsers(data.users || []);

        }

        catch(error){

            console.log(error);

        }

        finally{

            setLoading(false);

        }

    };

    const filteredUsers = users.filter((user)=>

        user.name.toLowerCase().includes(

            search.toLowerCase()

        )

    );

    if(loading){

        return <h2>Loading Users...</h2>;

    }

    return(

        <div className="user-management-page">

            <div className="user-header">

                <h1>

                    User Management

                </h1>

                <p>

                    Manage all registered users.

                </p>

            </div>

            <div className="user-toolbar">

                <input

                    type="text"

                    placeholder="Search users..."

                    value={search}

                    onChange={(e)=>

                        setSearch(e.target.value)

                    }

                />

            </div>

            <div className="users-table">
                                <table>

                    <thead>

                        <tr>

                            <th>

                                Name

                            </th>

                            <th>

                                Email

                            </th>

                            <th>

                                Phone

                            </th>

                            <th>

                                Role

                            </th>

                            <th>

                                Status

                            </th>

                            <th>

                                Actions

                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            filteredUsers.map((user) => (

                                <tr key={user._id}>

                                    <td>

                                        {user.name}

                                    </td>

                                    <td>

                                        {user.email}

                                    </td>

                                    <td>

                                        {user.phone || "N/A"}

                                    </td>

                                    <td>

                                        <select
                                            defaultValue={user.role}
                                        >

                                            <option value="user">

                                                User

                                            </option>

                                            <option value="admin">

                                                Admin

                                            </option>

                                        </select>

                                    </td>

                                    <td>

                                        <button
                                            className={
                                                user.isBlocked
                                                    ? "unblock-btn"
                                                    : "block-btn"
                                            }
                                        >

                                            {

                                                user.isBlocked

                                                    ? "Unblock"

                                                    : "Block"

                                            }

                                        </button>

                                    </td>

                                    <td>

                                        <button
                                            className="delete-btn"
                                        >

                                            Delete

                                        </button>

                                    </td>

                                </tr>

                            ))

                        }

                    </tbody>

                </table>

            </div>
        </div>

    );

};

export default UserManagement;