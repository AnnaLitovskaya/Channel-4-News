const router = require('express')();
// const router = Router();
const {
  models: { User },
} = require('../db/models/associations');
const Family = require('../db/models/Family');
const { Transaction } = require('../db/models/Transaction');
const { route } = require('./families');

//interval scheduling
const schedule = require('node-schedule');
const { ToadScheduler, SimpleIntervalJob, Task } = require('toad-scheduler');

//get all users
router.get('/', async (req, res, next) => {
  try {
    res.send(await User.findAll());
  } catch (err) {
    next.err;
  }
});

//get single user by id
router.get('/:id', async (req, res, next) => {
  try {
    res.send(
      await User.findByPk(req.params.id, {
        include: [
          { model: Transaction },
          // { model: Allowance },
          { model: Family, include: [User] },
        ],
      })
    );
  } catch (err) {
    next(err);
  }
});

//create new user
router.post('/', async (req, res, next) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      status,
      isAdmin,
      stripeAccount,
    } = req.body;
    const newUser = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      status,
      isAdmin,
      stripeAccount,
    });
    res.status(201).send(newUser);
  } catch (err) {
    next(err);
  }
});

//delete user
router.delete('/:id', async (req, res, next) => {
  try {
    const userToDelete = await User.findByPk(req.params.id);
    await userToDelete.destroy();
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

// //upload image file
// router.put('/image/:id', async (req, res, next) => {
//   console.log(req.file);
//   try {
//     res.send({ file: req.file });
//   } catch (err) {
//     next(err);
//   }
// });

//update user
router.put('/:id', async (req, res, next) => {
  try {
    const userToUpdate = await User.findByPk(req.params.id);
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      imgUrl,
      status,
      isAdmin,
      familyId,
      stripeAccount,
      cardHolderId,
      virtualCard,
      cardColor,
      cardImage,
    } = req.body;

    await userToUpdate.update({
      username,
      email,
      password,
      firstName,
      lastName,
      imgUrl,
      status,
      isAdmin,
      familyId,
      stripeAccount,
      cardHolderId,
      virtualCard,
      cardColor,
      cardImage,
    });
    res.status(200).send(userToUpdate);
  } catch (err) {
    next(err);
  }
});

//created scheduler
const scheduler = new ToadScheduler();

//route to add allowance
router.put('/allowance/:id', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    const { allowance } = req.body;
    await user.update({ balance: user.balance * 1 + allowance });
    const add = new Task('allowance', async () => {
      await user.update({ balance: user.balance * 1 + allowance });
      console.log('adding allowance');
    });
    const newJob = new SimpleIntervalJob({ minutes: 1 }, add);
    scheduler.addSimpleIntervalJob(newJob);
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

// // run on particular date
// const someDate = new Date('2021-06-14T20:07.00.000-04:00');
// schedule.scheduleJob(someDate, () => {
//   console.log('Job ran @', new Date().toString());
// });

// //run at interval
// schedule.scheduleJob(' */2  * * * *', () => {
//   console.log('I ran ...');
// });

module.exports = router;
