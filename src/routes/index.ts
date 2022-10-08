import express from "express"
import loginRoute from "./userAuth/login"
import registerRoute from "./userAuth/register"
import updatePasswordRoute from "./userAuth/updatePassword"
import verifySession from "./userAuth/verifySession"
import productsRoute from "./products"
import usersRoute from "./users"
import ordersRoute from "./orders"

const app = express.Router()

app.use("/", loginRoute)
app.use("/", registerRoute)
app.use("/", updatePasswordRoute)
app.use("/", verifySession)

app.use("/", usersRoute)
app.use("/", productsRoute)
app.use("/", ordersRoute)

export default app
