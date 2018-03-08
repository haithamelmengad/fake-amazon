import express from 'express';
import validators from 'express-validators';
import passport from 'passport';
import crypto from 'crypto';
import {User} from '../models';
import {Product} from '../models';
import products from '../seed/products.json';

var router = express.Router();

/* GET home page. */
// router.get('/', (req, res, next) => {
//   var arrayProductsPromises = products.map(product => new Product(product).save())
//   Promise.all(arrayProductsPromises)
//   .catch(error => console.log(error))
//   .then((arrayofProducts)=> {
//     console.log(arrayofProducts);
//     res.render('allproducts', {
//     arrayofProducts
//     })
//     }
//   );
// });


router.get('/', (req, res, next) => {
  Product.find({})
  .catch(error => console.log(error))
  .then((arrayofProducts) => {
    res.render('allproducts', {arrayofProducts});
  })
});

router.get('/product/:pid', (req, res, next) => {
  // Insert code to look up all a single product by its id
  // and show it on the page
  Product.findById (req.params.pid)
  .catch(error => (console.log(error)))
  .then((product) => res.render('product', {product}) )

});

router.get('/register', function(req, res, next) {
  res.render('register');
});

router.post('/register', function(req, res, next){
  function hashPassword(password){
    var hash= crypto.createHash('sha256');
    hash.update(password);
    return hash.digest('hex')
  };
  if(req.body.username && req.body.password ){
    var newUser = new User({
      username: req.body.username,
      password: hashPassword(req.body.password)
    })
    newUser.save(
      function(error){
        if(error){ 
         return error;
        } 
        return
    })
    res.redirect('login');
  } else {
    console.log('Please enter a valid username and password')
  }
});

router.get('/login', (req, res, next) => {
  res.render('login');
});

router.post('/login', passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/login'
    }), (req, res) => {
    req.session.cart = [];
    req.session.save((error) =>  error ? console.log(error) : res.render('user', { user: req.user }))
});

router.get('/logout', (req, res, next) => {
  res.render('login');
});

router.post('/', (req, res, next) => {
  res.render('');
})

router.get('/cart', (req, res, next) => {
  res.render('carts', {carts: req.session.cart});
})

router.post('/cart/add/:pid', (req, res, next) => {
  Product.findById(req.params.pid)
  .then((product)=> {
    var isDuplicate = false;
    var count = 0 ;
    var index = 0;
    req.session.cart.forEach(productofCart => {
      if(productofCart._id.toString()===product._id.toString()){
      isDuplicate=true;
       index=count;
      }
      count++
    })
    if(isDuplicate === false){
      req.session.cart.push(product)
        return req.session.save()
    } else {
      if(!req.session.cart[index].quantity){
        req.session.cart[index].quantity = 2;
      } else {
        req.session.cart[index].quantity += 1;
      }
    }
  })
  .then(() => res.render('carts', {carts: req.session.cart}))
})

router.post('/cart/delete/:pid', (req, res, next) => {
  console.log(req.params.pid);
    Product.findById(req.params.pid)
    .then((product) => {
      console.log(product, 'product')
        var count = 0 ;
        var index = 0;
        req.session.cart.forEach(productofCart => {
          if(productofCart._id.toString()=== product._id.toString()){
          index=count;
          }
          count++
        })
        console.log('index', index);
        if (!req.session.cart[index].quantity){
          req.session.cart.splice(index, 1);
        } else {
          req.session.cart[index].quantity -= 1;
        }    
        return req.session.save()
    })
    .then(()=> res.render('carts', {carts: req.session.cart}))
  // Insert code that takes a product id (pid), finds that product
  // and removes it from the cart array. Remember that you need to use
  // the .equals method to compare Mongoose ObjectIDs.
})

router.post('/cart/delete', (req, res, next) => {
  req.session.cart.length = 0;
  req.session.save((error, newcart) => error?console.log(error):res.redirect('/cart'))
});

export default router;
