import { MongoClient } from "mongodb";
import cors from "cors";
// const express = require("express"); // "type": "commonjs"
import express, { response } from "express"; // "type": "module"
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { GetHallWithNo, InsertNewHall, setBookedStatus, InsertNewBooking } from "./Services.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

async function MongoConnect() {
  const client = await new MongoClient(MONGO_URL).connect();
  console.log("Mongo Connected");
  return client;
}

export const client = await MongoConnect();



app.get("/", function (request, response) {
  response.send("🙋‍♂️ Welcome to Hall Booking API");
});

app.post("/createhall", async function (req, res) {
  let { hallNo, seats, amenities, price } = req.body;
  let fullbody = req.body;
  let dbHall = await GetHallWithNo(hallNo);
  if (dbHall) {
    res
      .status(200)
      .send({ msg: "Hall already present, you can update the hall" });
  } else {
    let newHall = await InsertNewHall(req.body);
    let setBookingStatus = await setBookedStatus(hallNo, false);
    res
      .status(200)
      .send({ msg: `Hall created with Hall No. ${hallNo}`, newHall });
  }
});

app.post("/bookhall", async function (req, res) {
  const { hallNo, customerName, date, startTime, endTime } = req.body;
  let dbHall = await GetHallWithNo(hallNo);
  if (dbHall) {
    if (dbHall.booked) {
      let dbBookedCustomer = await client
        .db("HallBooking")
        .collection("Bookings")
        .findOne({ customerName: customerName });

      res
        .status(200)
        .send({
          msg: `Hall already booked by: ${dbBookedCustomer.customerName}`,
          dbBookedCustomer,
        });
    } else {
      let newBooking = await InsertNewBooking(req);
      let updateHall = await setBookedStatus(hallNo, true);
      res.status(200).send({
        msg: `Hall booked successfully for ${customerName} from ${startTime} to  ${endTime} ; Hall No.${hallNo}`,
        newBooking,
        updateHall,
      });
    }
  } else {
    res
      .status(200)
      .send({
        msg: `No hall present!; Create a new hall to book or allot choose a different hall`,
      });
  }
});

app.get("/getallbookings", async function (req, res) {
  let dbBookings = await client
    .db("HallBooking")
    .collection("Bookings")
    .find()
    .toArray();
  let dbBookingsCount = await client
    .db("HallBooking")
    .collection("Bookings")
    .countDocuments();
  if (dbBookingsCount !== 0) {
    res.status(200).send(dbBookings);
  } else {
    res.status(200).send({ msg: `No Bookings yet` });
  }
});

app.get("/getallbookedcustomers", async function (req, res) {
  let dbBookedCustomers = await client
    .db("HallBooking")
    .collection("Bookings")
    .find({}).project({customerName:1,_id:0})
    .toArray();
  let dbBookingsCount = await client
    .db("HallBooking")
    .collection("Bookings")
    .countDocuments();
  if (dbBookingsCount !== 0) {
    res.status(200).send({dbBookedCustomers,dbBookingsCount});
  } else {
    res.status(200).send({ msg: `No Customers in bookings collection` });
  }
});

app.get("/getallhalls", async function (req, res) {
  let dbAllHalls = await client
    .db("HallBooking")
    .collection("Halls")
    .find()
    .toArray();
  let dbHallsCount = await client
    .db("HallBooking")
    .collection("Halls")
    .countDocuments();
  res.status(200).send({ msg: `Halls with:`, dbAllHalls, dbHallsCount });
});

app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));




