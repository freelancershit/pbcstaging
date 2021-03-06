var express = require('express');
var router = express.Router();
var expressSanitizer = require("express-sanitizer");
var User = require("../models/user");
var Pending = require("../models/pending");
var News = require("../models/newsAndAnnouncement");
var Curriculum = require("../models/curriculum");
var Subject = require("../models/subject");
var async = require("async");
var passport = require("passport");
var passportConfig = require("../config/passport");

router.use(expressSanitizer());

function adminAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.isAdmin || req.user.superUser) {
      return next();
    } else {
      return res.redirect('back');
    }
  } else {
    return res.redirect('/login');
  }
}

router.get("/users/new", adminAuthentication, function(req, res, next){
        User.count({user: "admin"}).exec(function(err, adminCount){
            var adminNumber = (new Date()).getFullYear() +  "000000";
            var adminCounter = parseInt(adminNumber) + parseInt(adminCount);
        User.count({user: "faculty"}).exec(function(err, facultyCount){
            var facultyNumber = (new Date()).getFullYear() +  "0000000";
            var facultyCounter = parseInt(facultyNumber) + parseInt(facultyCount);
        User.count({user: "student"}).exec(function(err, studentCount){
            if(err) return next(err);
            var studentNumber = (new Date()).getFullYear() +  "00000000";
            var studentCounter = parseInt(studentNumber) + parseInt(studentCount);
            res.render("admin/users-new", {
                errors: req.flash("errors"), 
                studentCount: studentCounter, 
                facultyCount: facultyCounter, 
                adminCount: adminCounter
                });
            });
        });
    });
});

router.post("/users", adminAuthentication, function(req, res, next){
// async.waterfall([
//     function(callback){
    var user = new User();
    if(req.body.firstName && req.body.middleName && 
       req.body.lastName && req.body.age && req.body.address && 
       req.body.email && req.body.contact && req.body.user &&
       req.body.section && req.body.yrLvl && req.body.idNumber &&
       req.body.contact && req.body.year && req.body.month &&
       req.body.day && req.body.password && req.body.confirmPassword
    ){    
    user.profile.name = req.body.firstName + " " + req.body.middleName + " " + req.body.lastName;
    user.profile.firstName= req.body.firstName;
    user.profile.lastName= req.body.lastName;
    user.profile.middleName = req.body.middleName;
    user.email = req.body.email;
    user.profile.picture = user.gravatar();
    user.age = req.body.age;
    user.user = req.body.user;
    user.section = req.body.section;
    user.yrLvl = req.body.yrLvl;
    user.idNumber = req.body.idNumber;
    user.gender = req.body.gender;
    user.address = req.body.address;

    user.contact = "+63" + parseInt(req.body.contact);
    // if(user.user === "admin"){
    //     User.count({user: user.user}).exec(function(err, count){
    //     var number = (new Date()).getFullYear() +  "000000";
    //     user.idNumber = parseInt(number) + count;
    // });
    // } else if(user.user === "faculty"){
    //     User.count({user: user.user}).exec(function(err, count){
    //         var number = (new Date()).getFullYear() +  "000000";
    //         user.idNumber = parseInt(number) + count;
    //     });
    // }else{
    //     User.count({user: user.user}).exec(function(err, count){
    //         var number = (new Date()).getFullYear() +  "000000";
    //         user.idNumber = parseInt(number) + count;
    //     });
    // }
    user.birthdate = new Date(req.body.year + "-" + req.body.month + "-" + req.body.day);
    if(!(req.body.password === req.body.confirmPassword)){
        req.flash("errors", "Your password and confirm password does not match");
        return res.redirect("/users/new");
    }
    if(req.body.user === "faculty"){
        user.isAdmin = true;
    } else if(req.body.user === "admin"){
        user.isAdmin = true;
        user.superUser = true;
    } else{
        user.isAdmin = false;
    }

    user.password = req.body.password;
    User.findOne({email : req.body.email}, function(err, existingUser){
    if(existingUser){
        req.flash("errors", "Account with that email address already exist");
        return res.redirect("/users/new");
    } else{
        user.save(function(err, user){
            if(err) return next(err);
            res.redirect("/users/new");
            // callback(null, user);
        });
        console.log(user);
    }
  });
  //     },
  //     function(user){
  //         var cart = new Cart();
  //         cart.owner = user._id;
  //         cart.save(function(err){
  //             if(err) return next(err);
  //             res.redirect("/users");
  //         });
  //     }
  // ]);


//     },
//     function(user){
//         var cart = new Cart();
//         cart.owner = user._id;
//         cart.save(function(err){
//             if(err) return next(err);
//             res.redirect("/users");
//         });
//     }
// ]);
    } else{
        console.log(req.body);
        req.flash("errors", "Please fillup all the required information.");
        res.redirect("/users/new");
    }
});

router.get("/manage", function(req, res, next){
    Pending.find({}, function(err, allPending){
        if(err) return next(err);
        res.render("admin/manage-users", {allPending: allPending});
    });
});

router.get("/manage/:id", function(req, res, next){
    Pending.findById(req.params.id, function(err, pending){
        User.count({user: "student"}).exec(function(err, studentCount){
            if(err) return next(err);
            var studentNumber = (new Date()).getFullYear() +  "00000000";
            var studentCounter = parseInt(studentNumber) + parseInt(studentCount);
        if(err) return next(err);
        res.render("admin/register-student", {
            pending: pending, 
            studentCount: studentCounter,
            errors: req.flash("errors"),
            success: req.flash("success")
            });
        });
    });
});

router.post("/manage/:id", adminAuthentication, function(req, res, next){
    // async.waterfall([
    //     function(callback){
        var user = new User();
        if(req.body.firstName && req.body.middleName && 
           req.body.lastName && req.body.age && req.body.address && 
           req.body.email && req.body.contact && req.body.user &&
           req.body.section && req.body.yrLvl && req.body.idNum &&
           req.body.year && req.body.month && req.body.gender &&
           req.body.day && req.body.password && req.body.confirmPassword
        ){    
        user.profile.name = req.body.firstName + " " + req.body.middleName + " " + req.body.lastName;
        user.profile.firstName= req.body.firstName;
        user.profile.lastName= req.body.lastName;
        user.profile.middleName = req.body.middleName;
        user.email = req.body.email;
        user.profile.picture = user.gravatar();
        user.age = req.body.age;
        user.user = req.body.user;
        user.section = req.body.section;
        user.yrLvl = req.body.yrLvl;
        user.idNumber = req.body.idNum;
        user.gender = req.body.gender
        user.address = req.body.address        
        user.contact = "+63" + parseInt(req.body.contact);
        // if(user.user === "admin"){
        //     User.count({user: user.user}).exec(function(err, count){
        //     var number = (new Date()).getFullYear() +  "000000";
        //     user.idNumber = parseInt(number) + count;
        // });
        // } else if(user.user === "faculty"){
        //     User.count({user: user.user}).exec(function(err, count){
        //         var number = (new Date()).getFullYear() +  "000000";
        //         user.idNumber = parseInt(number) + count;
        //     });
        // }else{
        //     User.count({user: user.user}).exec(function(err, count){
        //         var number = (new Date()).getFullYear() +  "000000";
        //         user.idNumber = parseInt(number) + count;
        //     });
        // }
        user.birthdate = new Date(req.body.year + "-" + req.body.month + "-" + req.body.day);
        if(!(req.body.password === req.body.confirmPassword)){
            req.flash("errors", "Your password and confirm password does not match");
            return res.redirect("/manage/" + req.param.id);
        }
        if(req.body.user === "faculty"){
            user.isAdmin = true;
        } else if(req.body.user === "admin"){
            user.isAdmin = true;
            user.superUser = true;
        } else{
            user.isAdmin = false;
        }
    
        user.password = req.body.password;
        User.findOne({email : req.body.email}, function(err, existingUser){
        if(existingUser){
            req.flash("errors", "Account with that email address already exist");
            return res.redirect("/manage/" + req.params.id);
        } else{
            user.save(function(err, user){
                if(err) return next(err);
                Pending.findByIdAndRemove(req.params.id, function(err, pendingUser){
                  if(err) return next(err);
                  console.log(pendingUser);                
                  res.redirect("/manage");
                  
                });
                // callback(null, user);
            });
        }
    });
    
    
    //     },
    //     function(user){
    //         var cart = new Cart();
    //         cart.owner = user._id;
    //         cart.save(function(err){
    //             if(err) return next(err);
    //             res.redirect("/users");
    //         });
    //     }
    // ]);
        } else{
            req.flash("errors", "Please fillup all the required information.");
            console.log(req.body);
            res.redirect("/manage/" + req.params.id);
        }
    });

    router.delete("/manage/:id", function(req, res, next){
      Pending.findByIdAndRemove(req.params.id, function(err, pendingUser){
        if(err) return next(err);
        res.redirect("/manage");
      });
    });

    router.get('/manageaccount', function(req, res, next) {
      User.find({}, function(err, allUsers){
        res.render('admin/manageaccount', {users: allUsers});
      });
    });

    router.get('/manageaccount/:id', function(req, res, next) {
      User.findById(req.params.id, function(err, user){
        if(err) return next(err);
        console.log(user);
        res.render('admin/userdetails', {user: user});
      });
    });

    router.get('/postnewsandannouncements', function(req, res, next) {
            
        News.count().exec(function(err, counter){
            res.render('admin/postnews', {counter: counter});
        });
    });

    router.post("/postnewsandannouncements", function(req, res, next){
      if(req.body.category && req.body.title && req.body.content){
        var news = new News();       
        news.postNumber = req.body.postNumber; 
        news.category = req.body.category;
        news.title = req.body.title;
        news.content = req.sanitize(req.body.content);
        news.save(function(err, news){
          if(err) return next(err);
          console.log(news);
          res.redirect("/postnewsandannouncements");
        });
      } 
      console.log(req.body);
    });

    router.get('/managenewsandannouncements', function(req, res, next) {
        News.find({archive : false}, function(err, allNews){
            if(err) return next(err);
        res.render('admin/managenews', {allNews: allNews});
        });
    });

    router.delete("/managenewsandannouncements/:id", function(req, res, next){
        News.findById(req.params.id, function(err, news){
            news.archive = true;
            news.content = req.sanitize(req.body.content);
            news.save(function(err, news){
            if(err) return next(err);
            res.redirect("/managenewsandannouncements");
            });
        });
    });

    router.post("/managenewsandannouncements/:id/edit", function(req, res, next){
        News.findById(req.params.id, function(err, news){
            if(err) return next(err);
            news.category = req.body.category;
            news.title = req.body.title;
            news.content = req.body.content;
            news.save(function(err, news){
                if(err) return next(err);
                res.redirect("/managenewsandannouncements");
            });
        });
    });

    router.get("/enrollment", function(req, res, next){
        User.find({user: "student"}, function(err, users){
            if(err) return next(err);
            res.render("admin/enroll-student", {users: users})
        });
    });

    router.get("/enrollment/:id", function(req, res, next){
        User.findById(req.params.id, function(err, user){
            if(err) return next(err);
            User.find({user: "faculty"}, function(err, faculties){
                if(err) return next(err);
                res.render("admin/enrolling", {user: user, faculties: faculties});
            });
        });
    });

    router.post("/enrollment/:id", function(req, res, next){
        var curriculum = new Curriculum();
        User.findById(req.params.id, function(err, user){
            user.section = req.body.section;
            user.yrLvl = req.body.yrLvl;
            curriculum.firstName = user.profile.firstName;
            curriculum.middleName = user.profile.middleName;
            curriculum.lastName = user.profile.lastName;
            curriculum.email = user.email;
            curriculum.studentId = user._id;
            curriculum.yrLvl = req.body.yrLvl;
            curriculum.section = req.body.section;
            console.log(user);
            console.log(req.body.yrLvl + " and " + req.body.yrLvl.length);
            if(req.body.yrLvl === "grade1" || req.body.yrLvl === "grade2"){
                var subject1 = new Subject();
                subject1.subject = req.body.subject1;
                subject1.email = user.email;
                subject1.firstName = user.profile.firstName;
                subject1.middleName = user.profile.middleName;
                subject1.lastName = user.profile.lastName;
                subject1.section = req.body.section;
                subject1.yrLvl = req.body.yrLvl;
                subject1.faculty = req.body.faculty1;
                curriculum.subjects.push(subject1);
                subject1.save();
                var subject2 = new Subject();
                subject2.subject = req.body.subject2;
                subject2.email = user.email;
                subject2.firstName = user.profile.firstName;
                subject2.middleName = user.profile.middleName;
                subject2.lastName = user.profile.lastName;
                subject2.section = req.body.section;
                subject2.yrLvl = req.body.yrLvl;
                subject2.faculty = req.body.faculty2;
                curriculum.subjects.push(subject2);
                subject2.save();
                var subject3 = new Subject();
                subject3.subject = req.body.subject3;
                subject3.email = user.email;
                subject3.firstName = user.profile.firstName;
                subject3.middleName = user.profile.middleName;
                subject3.lastName = user.profile.lastName;
                subject3.section = req.body.section;
                subject3.yrLvl = req.body.yrLvl;
                subject3.faculty = req.body.faculty3;
                curriculum.subjects.push(subject3);
                subject3.save();
                var subject4 = new Subject();
                subject4.subject = req.body.subject4;
                subject4.email = user.email;
                subject4.firstName = user.profile.firstName;
                subject4.middleName = user.profile.middleName;
                subject4.lastName = user.profile.lastName;
                subject4.section = req.body.section;
                subject4.yrLvl = req.body.yrLvl;
                subject4.faculty = req.body.faculty4;
                curriculum.subjects.push(subject4);
                subject4.save();
                var subject5 = new Subject();
                subject5.subject = req.body.subject5;
                subject5.email = user.email;
                subject5.firstName = user.profile.firstName;
                subject5.middleName = user.profile.middleName;
                subject5.lastName = user.profile.lastName;
                subject5.section = req.body.section;
                subject5.yrLvl = req.body.yrLvl;
                subject5.faculty = req.body.faculty5;
                curriculum.subjects.push(subject5);
                subject5.save();
                var subject6 = new Subject();
                subject6.subject = req.body.subject6;
                subject6.email = user.email;
                subject6.firstName = user.profile.firstName;
                subject6.middleName = user.profile.middleName;
                subject6.lastName = user.profile.lastName;
                subject6.section = req.body.section;
                subject6.yrLvl = req.body.yrLvl;
                subject6.faculty = req.body.faculty6;
                curriculum.subjects.push(subject6);
                subject6.save();
                var subject7 = new Subject();
                subject7.subject = req.body.subject7;
                subject7.email = user.email;
                subject7.firstName = user.profile.firstName;
                subject7.middleName = user.profile.middleName;
                subject7.lastName = user.profile.lastName;
                subject7.section = req.body.section;
                subject7.yrLvl = req.body.yrLvl;
                subject7.faculty = req.body.faculty7;
                curriculum.subjects.push(subject7);
                subject7.save();
                user.save(function(err, user){
                    if(err) return next(err);
                    console.log(user);
                });
                curriculum.save(function(err, curr){
                    if(err) return next(err);
                    console.log(curr);
                });
                console.log(req.body.faculty1 + ", " +req.body.faculty2 + ", " +req.body.faculty3 + ", " +req.body.faculty4 + ", " +req.body.faculty5 + ", " +req.body.faculty6 + ", " +req.body.faculty7);
                console.log("Success");
            } else if(req.body.yrLvl === "grade3"){
                var subject1 = new Subject();
                subject1.subject = req.body.subject1;
                subject1.email = user.email;
                subject1.firstName = user.profile.firstName;
                subject1.middleName = user.profile.middleName;
                subject1.lastName = user.profile.lastName;
                subject1.section = req.body.section;
                subject1.yrLvl = req.body.yrLvl;
                subject1.faculty = req.body.faculty1;
                curriculum.subjects.push(subject1);
                subject1.save();
                var subject2 = new Subject();
                subject2.subject = req.body.subject2;
                subject2.email = user.email;
                subject2.firstName = user.profile.firstName;
                subject2.middleName = user.profile.middleName;
                subject2.lastName = user.profile.lastName;
                subject2.section = req.body.section;
                subject2.yrLvl = req.body.yrLvl;
                subject2.faculty = req.body.faculty2;
                curriculum.subjects.push(subject2);
                subject2.save();
                var subject3 = new Subject();
                subject3.subject = req.body.subject3;
                subject3.email = user.email;
                subject3.firstName = user.profile.firstName;
                subject3.middleName = user.profile.middleName;
                subject3.lastName = user.profile.lastName;
                subject3.section = req.body.section;
                subject3.yrLvl = req.body.yrLvl;
                subject3.faculty = req.body.faculty3;
                curriculum.subjects.push(subject3);
                subject3.save();
                var subject4 = new Subject();
                subject4.subject = req.body.subject4;
                subject4.email = user.email;
                subject4.firstName = user.profile.firstName;
                subject4.middleName = user.profile.middleName;
                subject4.lastName = user.profile.lastName;
                subject4.section = req.body.section;
                subject4.yrLvl = req.body.yrLvl;
                subject4.faculty = req.body.faculty4;
                curriculum.subjects.push(subject4);
                subject4.save();
                var subject5 = new Subject();
                subject5.subject = req.body.subject5;
                subject5.email = user.email;
                subject5.firstName = user.profile.firstName;
                subject5.middleName = user.profile.middleName;
                subject5.lastName = user.profile.lastName;
                subject5.section = req.body.section;
                subject5.yrLvl = req.body.yrLvl;
                subject5.faculty = req.body.faculty5;
                curriculum.subjects.push(subject5);
                subject5.save();
                var subject6 = new Subject();
                subject6.subject = req.body.subject6;
                subject6.email = user.email;
                subject6.firstName = user.profile.firstName;
                subject6.middleName = user.profile.middleName;
                subject6.lastName = user.profile.lastName;
                subject6.section = req.body.section;
                subject6.yrLvl = req.body.yrLvl;
                subject6.faculty = req.body.faculty6;
                curriculum.subjects.push(subject6);
                subject6.save();
                var subject7 = new Subject();
                subject7.subject = req.body.subject7;
                subject7.email = user.email;
                subject7.firstName = user.profile.firstName;
                subject7.middleName = user.profile.middleName;
                subject7.lastName = user.profile.lastName;
                subject7.section = req.body.section;
                subject7.yrLvl = req.body.yrLvl;
                subject7.faculty = req.body.faculty7;
                curriculum.subjects.push(subject7);
                subject7.save();
                var subject8 = new Subject();
                subject8.subject = req.body.subject8;
                subject8.email = user.email;
                subject8.firstName = user.profile.firstName;
                subject8.middleName = user.profile.middleName;
                subject8.lastName = user.profile.lastName;
                subject8.section = req.body.section;
                subject8.yrLvl = req.body.yrLvl;
                subject8.faculty = req.body.faculty8;
                curriculum.subjects.push(subject8);
                subject8.save();
                user.save(function(err, user){
                    if(err) return next(err);
                    console.log(user);
                });
                curriculum.save(function(err, curr){
                    if(err) return next(err);
                    console.log(curr);
                });
                console.log("Success");
            } else if(req.body.yrLvl === "grade7" || req.body.yrLvl === "grade8" || req.body.yrLvl === "grade9" || req.body.yrLvl === "grade10"){
                var subject1 = new Subject();
                subject1.subject = req.body.subject1;
                subject1.email = user.email;
                subject1.firstName = user.profile.firstName;
                subject1.middleName = user.profile.middleName;
                subject1.lastName = user.profile.lastName;
                subject1.section = req.body.section;
                subject1.yrLvl = req.body.yrLvl;
                subject1.faculty = req.body.faculty1;
                subject1.save();                
                curriculum.subjects.push(subject1);
                var subject2 = new Subject();
                subject2.subject = req.body.subject2;
                subject2.email = user.email;
                subject2.firstName = user.profile.firstName;
                subject2.middleName = user.profile.middleName;
                subject2.lastName = user.profile.lastName;
                subject2.section = req.body.section;
                subject2.yrLvl = req.body.yrLvl;
                subject2.faculty = req.body.faculty2;
                subject2.save();                                
                curriculum.subjects.push(subject2);
                var subject3 = new Subject();
                subject3.subject = req.body.subject3;
                subject3.email = user.email;
                subject3.firstName = user.profile.firstName;
                subject3.middleName = user.profile.middleName;
                subject3.lastName = user.profile.lastName;
                subject3.section = req.body.section;
                subject3.yrLvl = req.body.yrLvl;
                subject3.faculty = req.body.faculty3;
                subject3.save();                
                curriculum.subjects.push(subject3);
                var subject4 = new Subject();
                subject4.subject = req.body.subject4;
                subject4.email = user.email;
                subject4.firstName = user.profile.firstName;
                subject4.middleName = user.profile.middleName;
                subject4.lastName = user.profile.lastName;
                subject4.section = req.body.section;
                subject4.yrLvl = req.body.yrLvl;
                subject4.faculty = req.body.faculty4;
                subject4.save();                
                curriculum.subjects.push(subject4);
                var subject5 = new Subject();
                subject5.subject = req.body.subject5;
                subject5.email = user.email;
                subject5.firstName = user.profile.firstName;
                subject5.middleName = user.profile.middleName;
                subject5.lastName = user.profile.lastName;
                subject5.section = req.body.section;
                subject5.yrLvl = req.body.yrLvl;
                subject5.faculty = req.body.faculty5;
                subject5.save();                
                curriculum.subjects.push(subject5);
                var subject6 = new Subject();
                subject6.subject = req.body.subject6;
                subject6.email = user.email;
                subject6.firstName = user.profile.firstName;
                subject6.middleName = user.profile.middleName;
                subject6.lastName = user.profile.lastName;
                subject6.section = req.body.section;
                subject6.yrLvl = req.body.yrLvl;
                subject6.faculty = req.body.faculty6;
                subject6.save();                
                curriculum.subjects.push(subject6);
                var subject7 = new Subject();
                subject7.subject = req.body.subject7;
                subject7.email = user.email;
                subject7.firstName = user.profile.firstName;
                subject7.middleName = user.profile.middleName;
                subject7.lastName = user.profile.lastName;
                subject7.section = req.body.section;
                subject7.yrLvl = req.body.yrLvl;
                subject7.faculty = req.body.faculty7;
                subject7.save();                
                curriculum.subjects.push(subject7);
                var subject8 = new Subject();
                subject8.subject = req.body.subject8;
                subject8.email = user.email;
                subject8.firstName = user.profile.firstName;
                subject8.middleName = user.profile.middleName;
                subject8.lastName = user.profile.lastName;
                subject8.section = req.body.section;
                subject8.yrLvl = req.body.yrLvl;
                subject8.faculty = req.body.faculty8;
                curriculum.subjects.push(subject8);
                subject8.save();                
                var subject9 = new Subject();
                subject9.subject = req.body.subject9;
                subject9.email = user.email;
                subject9.firstName = user.profile.firstName;
                subject9.middleName = user.profile.middleName;
                subject9.lastName = user.profile.lastName;
                subject9.section = req.body.section;
                subject9.yrLvl = req.body.yrLvl;
                subject9.faculty = req.body.faculty9;
                subject9.save();                
                curriculum.subjects.push(subject9);
                user.save(function(err, user){
                    if(err) return next(err);
                    console.log(user);
                });
                curriculum.save(function(err, curr){
                    if(err) return next(err);
                    console.log(curr);
                });
                console.log("Success");
            } else if(req.body.yrLvl === "grade4" || req.body.yrLvl === "grade5" || req.body.yrLvl === "grade6"){
                var subject1 = new Subject();
                subject1.subject = req.body.subject1;
                subject1.email = user.email;
                subject1.firstName = user.profile.firstName;
                subject1.middleName = user.profile.middleName;
                subject1.lastName = user.profile.lastName;
                subject1.section = req.body.section;
                subject1.yrLvl = req.body.yrLvl;
                subject1.faculty = req.body.faculty1;
                subject1.save();                
                curriculum.subjects.push(subject1);
                var subject2 = new Subject();
                subject2.subject = req.body.subject2;
                subject2.email = user.email;
                subject2.firstName = user.profile.firstName;
                subject2.middleName = user.profile.middleName;
                subject2.lastName = user.profile.lastName;
                subject2.section = req.body.section;
                subject2.yrLvl = req.body.yrLvl;
                subject2.faculty = req.body.faculty2;
                subject2.save();                                
                curriculum.subjects.push(subject2);
                var subject3 = new Subject();
                subject3.subject = req.body.subject3;
                subject3.email = user.email;
                subject3.firstName = user.profile.firstName;
                subject3.middleName = user.profile.middleName;
                subject3.lastName = user.profile.lastName;
                subject3.section = req.body.section;
                subject3.yrLvl = req.body.yrLvl;
                subject3.faculty = req.body.faculty3;
                subject3.save();                
                curriculum.subjects.push(subject3);
                var subject4 = new Subject();
                subject4.subject = req.body.subject4;
                subject4.email = user.email;
                subject4.firstName = user.profile.firstName;
                subject4.middleName = user.profile.middleName;
                subject4.lastName = user.profile.lastName;
                subject4.section = req.body.section;
                subject4.yrLvl = req.body.yrLvl;
                subject4.faculty = req.body.faculty4;
                subject4.save();                
                curriculum.subjects.push(subject4);
                var subject5 = new Subject();
                subject5.subject = req.body.subject5;
                subject5.email = user.email;
                subject5.firstName = user.profile.firstName;
                subject5.middleName = user.profile.middleName;
                subject5.lastName = user.profile.lastName;
                subject5.section = req.body.section;
                subject5.yrLvl = req.body.yrLvl;
                subject5.faculty = req.body.faculty5;
                subject5.save();                
                curriculum.subjects.push(subject5);
                var subject6 = new Subject();
                subject6.subject = req.body.subject6;
                subject6.email = user.email;
                subject6.firstName = user.profile.firstName;
                subject6.middleName = user.profile.middleName;
                subject6.lastName = user.profile.lastName;
                subject6.section = req.body.section;
                subject6.yrLvl = req.body.yrLvl;
                subject6.faculty = req.body.faculty6;
                subject6.save();                
                curriculum.subjects.push(subject6);
                var subject7 = new Subject();
                subject7.subject = req.body.subject7;
                subject7.email = user.email;
                subject7.firstName = user.profile.firstName;
                subject7.middleName = user.profile.middleName;
                subject7.lastName = user.profile.lastName;
                subject7.section = req.body.section;
                subject7.yrLvl = req.body.yrLvl;
                subject7.faculty = req.body.faculty7;
                subject7.save();                
                curriculum.subjects.push(subject7);
                var subject8 = new Subject();
                subject8.subject = req.body.subject8;
                subject8.email = user.email;
                subject8.firstName = user.profile.firstName;
                subject8.middleName = user.profile.middleName;
                subject8.lastName = user.profile.lastName;
                subject8.section = req.body.section;
                subject8.yrLvl = req.body.yrLvl;
                subject8.faculty = req.body.faculty8;
                curriculum.subjects.push(subject8);
                subject8.save();                
                var subject9 = new Subject();
                subject9.subject = req.body.subject10;
                subject9.email = user.email;
                subject9.firstName = user.profile.firstName;
                subject9.middleName = user.profile.middleName;
                subject9.lastName = user.profile.lastName;
                subject9.section = req.body.section;
                subject9.yrLvl = req.body.yrLvl;
                subject9.faculty = req.body.faculty10;
                subject9.save();                
                curriculum.subjects.push(subject9);
                user.save(function(err, user){
                    if(err) return next(err);
                    console.log(user);
                });
                curriculum.save(function(err, curr){
                    if(err) return next(err);
                    console.log(curr);
                });
                console.log("Success");
            }
                
            console.log(user + " and " + curriculum);
            res.redirect("/enrollment");

        
        
        });
    });

    router.get('/studentlist', function(req, res, next) {
        User.find({user: "student"}, function(err, users){

        if(err) return next(err);
        res.render('admin/studentlist', {users: users});
        });
    });

    router.get("/studentlist/:id", function(req, res, next){
        Curriculum
        .findOne( {studentId : req.params.id, academicYear: (new Date()).getFullYear() + "-" +((new Date()).getFullYear() + 1) } )
        .populate("subjects")
        .exec(function(err, curriculum){
            console.log(curriculum);
            User.findById(req.params.id, function(err, user){
            res.render("admin/viewgrade", {curriculum : curriculum, user: user});            
        });
    });
    });


    

module.exports = router;
