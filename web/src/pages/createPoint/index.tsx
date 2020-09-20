/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet'
import logo from '../../assets/logo.svg'
import "./styles.css"
import api from '../../services/api'
import axios from 'axios'
import {LeafletMouseEvent} from 'leaflet'

interface Item{
    id:number;
    title: string;
    name_url: string;
}

interface IBGEUFResponse{
    sigla:string
}

interface IBGECityResponse{
   nome:string
}

const createPoint = () => {

    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);


    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedUf, setSelectedUf] = useState('0')
    const [selectedCity, setSelectedCity] = useState('0')
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0])
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0])

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        whatsapp: "",
    })

    const history = useHistory()
    useEffect(() =>{
        navigator.geolocation.getCurrentPosition(position =>{
            const {latitude, longitude} = position.coords
            setInitialPosition([latitude, longitude])
        })
    })

    useEffect(() => {
        api.get('/items').then(response => {
            let data = response.data
            
            setItems(data)

        })
    }, [])

    useEffect(()=>{
        axios.get<IBGEUFResponse[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
        .then(response => {
            const ufInitials = response.data.map(uf => uf.sigla).sort()
            setUfs(ufInitials)
        })
    },[selectedUf])

    useEffect(()=>{
        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
        .then(response => {
            
            const cityName = response.data.map(city=> city.nome)
            const cities = cityName.sort()
            
            setCities(cities)
        })
    },[selectedUf])

    function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value
        setSelectedUf(uf);
    }

    function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>){
        const city = event.target.value
        setSelectedCity(city);
    }

    function handleMapClick(event: LeafletMouseEvent){
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ])
    }
    
    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const {name, value} = event.target
        setFormData({...formData, [name]: value});        
    }

    function handleSelectedItem(id: number){
        const alreadySelected = selectedItems.findIndex(item => item === id);
        if(alreadySelected >=0){
            const filteredItems = selectedItems.filter(item => item !==id);
            setSelectedItems(filteredItems);
        }
        else{
            setSelectedItems([...selectedItems, id]);
        }      
    }

    async function handleSubmit(event: FormEvent){
        event.preventDefault()
        const{ name, email, whatsapp} = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const data = {
            name,
            email, 
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        }
        

        await api.post("points", data)
        alert("Ponto de coleta cadastrado")

        history.push('/')


    }
    
        
    

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="" />

                <Link to="/">
                    <FiArrowLeft />
                   Voltar para Home
               </Link>
            </header>

            <form onSubmit ={handleSubmit}>
                <h1>Cadastro do <br /> ponto de coleta</h1>

                <fieldset>
                    <legend>
                        Dados
                   </legend>


                    <div className="field">
                        <label htmlFor="name"> Nome da entidade</label>
                        <input type="text"
                            name="name"
                            id="name"
                            onChange ={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input type="text"
                                name="email"
                                id="email"
                                onChange ={handleInputChange}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange ={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>


                <fieldset>

                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecine o endereço no mapa</span>
                    </legend>
                    <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">Open5treetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                        <Marker position={[selectedPosition[0], selectedPosition[1]]} zoom={15} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={selectedUf} onChange={handleSelectedUf}>
                            <option value="0">Selecione uma UF</option>
                                {
                                    ufs.map(uf =>(
                                    <option key={uf}  value={uf}>{uf}</option>
                                    ))
                                }
                                
                            </select>

                        </div>


                        <div className="field">
                            <label htmlFor="uf">Cidade</label>
                            <select name="cidade" id="cidade"
                            value={selectedCity}
                            onChange={handleSelectedCity}>
                                <option value="0">Selecione uma cidade</option>
                                {
                                    cities.map(city =>(
                                    <option key={city}  value={city}>{city}</option>
                                    ))
                                }
                            </select>

                        </div>


                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecine um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {
                            items.map(item => (
                                <li key={item.id} 
                                onClick={() => handleSelectedItem(item.id)}
                                className={selectedItems.includes(item.id) ? "selected" : ""}>
                                    <img  src={item.name_url} alt={item.title} />
                                    <span>{item.title}</span>
                                </li>
                            ))
                        }
                    </ul>
                </fieldset>
                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    );
}

export default createPoint