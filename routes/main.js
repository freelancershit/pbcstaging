var express = require('express');
var router = express.Router();
var User = require('../models/user');

router.get('/', function(req, res, next) {
  res.render('main/home');
});

router.get('/activities', function(req, res, next) {
  res.render('main/activities');
});

router.get('/admindashboard', function(req, res, next) {
  res.render('admin/dashboard');
});

router.get('/registrationlist', function(req, res, next) {
  res.render('admin/registrationlist');
});

router.get('/managenewsandannouncements', function(req, res, next) {
  res.render('admin/managenews');
});

router.get('/postnewsandannouncements', function(req, res, next) {
  res.render('admin/postnews');
});

router.get('/facultydashboard', function(req, res, next) {
  res.render('faculty/dashboard');
});

router.get('/studentdashboard', function(req, res, next) {
  res.render('student/dashboard');
});

router.get('/admissionreq', function(req, res, next) {
  res.render('main/admissionreq');
});

router.get('/awards', function(req, res, next) {
  res.render('main/awards');
});

router.get('/clubs', function(req, res, next) {
  res.render('main/clubs');
});

router.get('/curriculum', function(req, res, next) {
  res.render('main/curriculum');
});

router.get('/facilities', function(req, res, next) {
  res.render('main/facilities');
});

router.get('/faculty', function(req, res, next) {
  res.render('main/faculty');
});

router.get('/gallery', function(req, res, next) {
  res.render('main/gallery');
});

router.get('/history', function(req, res, next) {
  res.render('main/history');
});

router.get('/home', function(req, res, next) {
  res.render('main/home');
});

router.get('/news', function(req, res, next) {
  res.render('main/news');
});

router.get('/orgchart', function(req, res, next) {
  res.render('main/orgchart');
});

router.get('/policies', function(req, res, next) {
  res.render('main/policies');
});

router.get('/register', function(req, res, next) {
  res.render('main/register');
});

router.get('/scholarships', function(req, res, next) {
  res.render('main/scholarships');
});

router.get('/service', function(req, res, next) {
  res.render('main/service');
});

router.get('/vmop', function(req, res, next) {
  res.render('main/vmop');
});

module.exports = router;
