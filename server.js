const express=require('express');
const axios=require('axios');

const app=express();
const PORT=9876;
const WINDOW_SIZE=10;
const ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzMTUwMTQzLCJpYXQiOjE3NDMxNDk4NDMsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjQ1YWNhNGZiLTkzZjctNGJkOS04ZTM5LTk1ZTQ4MDliM2Y0ZSIsInN1YiI6IjcyNzcyMmV1aXQwMDZAc2tjZXQuYWMuaW4ifSwiY29tcGFueU5hbWUiOiJTS0NFVCIsImNsaWVudElEIjoiNDVhY2E0ZmItOTNmNy00YmQ5LThlMzktOTVlNDgwOWIzZjRlIiwiY2xpZW50U2VjcmV0Ijoid01OZENvQVJ4V05Da2VzYiIsIm93bmVyTmFtZSI6IkFkYXJzaCIsIm93bmVyRW1haWwiOiI3Mjc3MjJldWl0MDA2QHNrY2V0LmFjLmluIiwicm9sbE5vIjoiNzI3NzIyZXVpdDAwNiJ9.0q73m6AaeUt3c10aoRHOy2YtyY_TpyOTJEch0rx3V-I";

const API_URLS={
    p:"http://20.244.56.144/test/primes",
    f:"http://20.244.56.144/test/fibo",
    e:"http://20.244.56.144/test/even",
    r:"http://20.244.56.144/test/rand"
};

let numberWindow=[];

app.get('/numbers/:numberid',async(req,res)=>{
    const{numberid}=req.params;

    if(!API_URLS[numberid]) 
        return res.status(400).json({error:"Invalid number ID. Use 'p','f','e',or 'r'."});

    let prevState=[...numberWindow];

    try{
        console.log(`Fetching ${numberid} numbers from ${API_URLS[numberid]}...`);
        const response=await axios.get(API_URLS[numberid],{
            timeout:5000,
            headers:{"Authorization":`Bearer ${ACCESS_TOKEN}`}
        });

        console.log("API Response:",response.data);

        if(!response.data||!response.data.numbers) 
            throw new Error("Invalid response from third-party API");

        let newNumbers=response.data.numbers.filter(num=>!numberWindow.includes(num));

        numberWindow.push(...newNumbers);
        if(numberWindow.length>WINDOW_SIZE) 
            numberWindow=numberWindow.slice(-WINDOW_SIZE);

        let avg=numberWindow.length>0?(numberWindow.reduce((a,b)=>a+b,0)/numberWindow.length).toFixed(2):0;

        return res.json({
            windowPrevState:prevState,
            windowCurrState:numberWindow,
            numbers:newNumbers,
            avg:avg
        });
    }
    catch(error){
        console.error("Error fetching numbers:",error.message);
        return res.status(500).json({error:"Failed to fetch numbers (timeout or authorization issue)."});
    }
});

app.listen(PORT,()=>{console.log(`Server running at http://localhost:${PORT}`)});
