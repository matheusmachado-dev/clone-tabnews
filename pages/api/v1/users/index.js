import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user.js";
import activation from "models/activation";
import authorization from "models/authorization";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.post(controller.canRequest("create:user"), postHandler);

export default router.handler(controller.errorHandler);

async function postHandler(request, response) {
  const userTryingToGet = request.context.user;

  const userInputValues = request.body;
  const newUser = await user.create(userInputValues);

  const activationToken = await activation.create(newUser.id);

  const secureOutputValues = authorization.filterOutput(userTryingToGet, "read:user", newUser)

  await activation.sendEmailToUser(newUser, activationToken);

  return response.status(201).json(secureOutputValues);
}
