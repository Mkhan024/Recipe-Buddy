const { check, validationResult } = require('express-validator');
const { response } = require('express');
// import fetch from "node-fetch";
const fetch = require('node-fetch');

module.exports = function(app, shopData) {
    
    const redirectLogin = (req, res, next) => { 
        if (!req.session.userId ) {
            res.redirect('./login')
        }   else { next (); }
    }


    //importing password hashing module (bcrypt)
    const bcrypt = require('bcrypt');

    // Handle our routes
    app.get('/',function(req,res){
        res.render('index.ejs', shopData)
    });
    app.get('/about',function(req,res){
        res.render('about.ejs', shopData);
    });
    app.get('/search',function(req,res){
        res.render("search.ejs", shopData);
    });
    app.get('/search-result', function (req, res) {
        //searching in the database
        //res.send("You searched for: " + req.query.keyword);

        let sqlquery = "SELECT * FROM books WHERE name LIKE '%" + req.query.keyword + "%'"; // query database to get all the books
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, shopData, {availableBooks:result});
            console.log(newData)
            res.render("list.ejs", newData)
         });        
    });

    app.get('/login',function(req,res){
        res.render("login.ejs", shopData);
    });
    app.post('/loggedIn', function(req,res){
        // Selects userDetails from SQL
        let sqlquery = "SELECT username, hashedPassword FROM userDetails WHERE username = '" + req.sanitize (req.body.username) + "';";
        
        // Variables
        let hashedPassword = '';
        let usernameTest = req.body.username;

        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            
            else if (result.length == 0){
                res.send('sorry, you entered the wrong username');
            }

            else{
                hashedPassword = result[0].hashedPassword;
                console.log('this is the password that is supposed to be on the database:', hashedPassword);
                console.log(result);

                // Hash password and Compare the password supplied with the password in the database
                
                bcrypt.compare(req.sanitize(req.body.password), hashedPassword, function(err, result) { 
                if (err) {
                    // Handle the error
                    return console.error(err.message);
                }

                else if (result == true) { 
                    // Save user session here, when login is successful
                    req.session.userId = req.sanitize(req.body.username);

                    // Send message
                    console.log('Congratulations, you signed in');
                    res.send('Congratulations, you signed in');
                }


                else {
                    // TODO: Send message
                    console.log("Sorry, you entered the wrong password");
                    res.send('Sorry, you entered the wrong password');
                }
                });
            }
         });
    });

    app.get('/logout', redirectLogin, (req,res) => { req.session.destroy(err => {
        if (err) {
              return res.redirect('./')
            }

        res.send('you are now logged out. <a href='+'./'+'>Home</a>');
        }) 
    });

    app.get('/listUsers',function(req,res){
        let sqlquery = "SELECT username FROM userDetails"; // query database to get all the users
        // execute sql query
        db.query(sqlquery, (err, result) => {

            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, shopData, {availableUsers:result});
            console.log(newData)
            res.render("listUsers.ejs", newData)
         });
    });

    app.get('/register', function (req,res) {  
        res.render('register.ejs', shopData);                                                                     
    });

    app.post('/registered', [check('email').isEmail(), check('plainPassword').isLength({min: 8})], function (req,res) {   
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.redirect('./register');
        }

        else {
        // salt rounds for password hashing
        const saltRounds = 10;
        const plainPassword = req.sanitize( req.body.plainPassword);
        //Hash the password
        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) { 
            //console log the password
            console.log(hashedPassword)
            // Store hashed password in your database.
            let sqlquery = `INSERT INTO userDetails (username, first, last, email, hashedPassword) VALUES (?,?,?,?,?)`;
            // execute sql query
           let newrecord = [req.sanitize (req.body.username),req.sanitize (req.body.first),req.sanitize (req.body.last),req.sanitize (req.body.email), hashedPassword];
           db.query(sqlquery, newrecord, (err, result) => {

                if (err) {
                    return console.error(err.message);
                }

                else{
                    result = 'Hello '+ req.body.first + ' '+ req.body.last +' you are now registered! We will send an email to you at ' + req.body.email;
                    result += ' Your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword;
                    res.send(result);
                }
            });
        })
    }
    });

    app.get('/list', redirectLogin, function(req, res) {
        let sqlquery = "SELECT * FROM books"; // query database to get all the books
        // execute sql query
        db.query(sqlquery, (err, result) => {

            if (err) {
                res.redirect('./'); 
            }

            let newData = Object.assign({}, shopData, {availableBooks:result});
            console.log(newData)
            res.render("list.ejs", newData)
         });
    });

    app.get('/addbook', function (req, res) {
        res.render('addbook.ejs', shopData);
     });

     app.post('/bookadded', function (req,res) {
           // saving data in database
           let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
           // execute sql query
           let newrecord = [req.body.name, req.body.price];
           db.query(sqlquery, newrecord, (err, result) => {
    
             if (err) {
               return console.error(err.message);
             }

             else
             res.send(' This book is added to database, name: '+ req.body.name + ' price '+ req.body.price);
             });
    });    

       app.get('/bargainbooks', function(req, res) {
        let sqlquery = "SELECT * FROM books WHERE price < 20";
        db.query(sqlquery, (err, result) => {

          if (err) {
             res.redirect('./');
          }
          let newData = Object.assign({}, shopData, {availableBooks:result});
          console.log(newData)
          res.render("bargains.ejs", newData)
        });
    });

        app.get('/weather', function (req, res) {
            const request = require('request');
            let apiKey = '9190b13570c73b9ab8b8fd5516c8f325'; 
            let city = 'london'; 
            let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
            
            request(url, function (err, response, body) {

            if(err){
                console.log('error:', error); 
            } 
            // Variables
            else { 
                // res.send(body);
                var weather = JSON.parse(body)
                var name = weather.name
                var temp = weather.main.temp
                var humid = weather.main.humidity
                var wind = weather.wind.speed
                var visib = weather.visibility
            // Displays inforamtion
            if (weather!==undefined && weather.main!==undefined) {
                let newData = Object.assign({}, shopData, {temp, name, humid, wind,visib});
                res.render("weather.ejs", newData);

            }

            else {
                res.send ("No data found");
            }
           }     
        });
    });

    app.get('/weather-search-result',function(req,res){
        const request = require('request');
        let apiKey = '9190b13570c73b9ab8b8fd5516c8f325'; 
        let city = req.query.keyword;
        let url =`http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
        
        request(url, function (err, response, body) { if(err){
            console.log('error:', error); } 
            //Variables
            else {
            var weather = JSON.parse(body)
            var name = weather.name
            var temp = weather.main.temp
            var humid = weather.main.humidity
            var wind = weather.wind.speed
            var visib = weather.visibility
            // Displays inforamtion
            if (weather!==undefined && weather.main!==undefined) {
                let newData = Object.assign({}, shopData, {temp, name, humid, wind,visib});
                res.render("weather.ejs", newData);
            }

            else {
                res.send ("No data found");
            }
          }
        });
    });

    app.get('/api', function (req,res) {

        //variables 
        let keyword = req.query.keyword;
        
            if (keyword != undefined) {
                // Query database to get all the books
                let query_search = "SELECT * FROM books WHERE name LIKE '%" + req.query.keyword + "%'";
                // Execute the sql query
                db.query(query_search, (err, result) => { if (err) {
                res.redirect('./');
                }
                
            // Return results as a JSON object
            res.json(result);
            });
        }

        else{
            let sqlquery = "SELECT * FROM books";
            // Execute the sql query
            db.query(sqlquery, (err, result) => {
                if (err) {
                    res.redirect('./');
                }
                res.json(result);
            });
        }
    });

        app.get('/tvshows', function (req, res) {
            res.render('tvshows.ejs', shopData);
        });
    
        app.get('/tvshows-search-result', async(req, res) => {

            //Variables
            let keyword = req.query.keyword;
            let tv_api = `https://api.tvmaze.com/search/shows?q=${keyword}`
            arr_name = "";
    
            if (keyword != "") {
                try {
                    await fetch(tv_api)
                    .then(res => res.json())
                    .then(data => {
                        //Design of display
                        for (let i = 0; i < data.length; i++){
                            arr_name += "<h3 style='color: blue; font-size:30px;'>" + data[i].show.name + "</h3>" + "\n" +
                                        "<h3 '> released on " + data[i].show.premiered + "</h3>" + "\n"

                            var id_episode = data[i].show.id
                            let tv_api = `https://api.tvmaze.com/shows/${id_episode}/episodes`
                            // displays info
                            try {
                                fetch(tv_api)
                                .then(res => res.json())
                                .then(data => {
                                    for (let i = 0; i < data.length; i++){
                                        arr_name += data[i].name
                                    }
                                })
                            // error catching
                            }   catch (err) {
                                console.log("Error: ", err)
                            }
                        }
                        res.send(arr_name);
                    })
                            // error catching
                }   catch (err) {
                    if (err) {
                        console.log('Error: ', err)
                    }
                }
            }

            else {
                res.send("Show not found, try again.")
            }

            res.render('tvshows.ejs', shopData);
        });
    }