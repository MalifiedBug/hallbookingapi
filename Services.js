import { client } from "./index.js";

export function setBookedStatus(hallNo, status) {
  return client
    .db("HallBooking")
    .collection("Halls")
    .updateOne({ hallNo: hallNo }, { $set: { booked: status } });
}
export function InsertNewBooking(req) {
  return client.db("HallBooking").collection("Bookings").insertOne(req.body);
}
export function InsertNewHall(req) {
  return client.db("HallBooking").collection("Halls").insertOne(req);
}
export function GetHallWithNo(hallNo) {
  return client
    .db("HallBooking")
    .collection("Halls")
    .findOne({ hallNo: hallNo });
}
