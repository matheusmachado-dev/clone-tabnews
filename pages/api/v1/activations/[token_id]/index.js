import controller from "infra/controller";
import activation from "models/activation";

const { createRouter } = require("next-connect");

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.patch(controller.canRequest("read:activation_token"), patchHandler);

export default router.handler(controller.errorHandler);

async function patchHandler(request, response) {
  const activationTokenId = request.query.token_id;

  const validActivationToken = await activation.findOneValidById(activationTokenId);
  
  await activation.activateUserByUserId(validActivationToken.user_id);
  
  const usedActivationToken = await activation.markTokenAsUsed(validActivationToken.id);

  return response.status(200).json(usedActivationToken);
}
