import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user.js";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandler);

async function getHandler(request, response) {
  const username = request.query.username;
  const userFound = await user.findOneByUsername(username);
  return response.status(200).json(userFound);
}
