import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AllPeople: React.FC = () => {
    const [people, setPeople] = useState<any[]>([]);

    useEffect(() => {
        const fetchPeople = async () => {
            try {
                const response = await axios.get(`${process.env.VITE_API_BASE_URL}/api/all_people`, {
                    params: {
                        token: localStorage.getItem('token')
                    }
                });
                // Check if the response has a 'data' property which is an array
                if (response.data && Array.isArray(response.data.data)) {
                    setPeople(response.data.data);
                } else if (Array.isArray(response.data)) {
                    setPeople(response.data);
                } else {
                    console.error("Response data is not an array:", response.data);
                }
            } catch (error) {
                console.error('Error fetching people:', error);
            }
        };

        fetchPeople();
    }, []);

    return (
        <div className="row">
            {Array.isArray(people) && people.map(person => {
                console.log('Person data:', person);
                const nombreTag = person.tags?.find((t: any) => t.tipo === 'nombre');
                const nombre = nombreTag ? nombreTag.valor : person.nombre;

                return (
                    <div key={person.id} className="col-md-4 mb-4">
                        <div className="card">
                            <img src={person.media && person.media.length > 0 ? person.media[0].url : 'https://placehold.co/150'} className="card-img-top" alt={nombre} />
                            <div className="card-body">
                                <h5 className="card-title">{nombre}</h5>
                                <button className="btn btn-primary">View Profile</button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AllPeople;
