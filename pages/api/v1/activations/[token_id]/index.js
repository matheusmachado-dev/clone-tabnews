import controller from "infra/controller";
import activation from "models/activation";

const { createRouter } = require("next-connect");

const router = createRouter();

router.patch(patchHandler);

export default router.handler(controller.errorHandler);

async function patchHandler(request, response) {
  const activationTokenId = request.query.token_id;

  const validActivationToken =
    await activation.findOneValidById(activationTokenId);

  const usedActivationToken = await activation.markTokenAsUsed(
    validActivationToken.id,
  );

  await activation.activateUserByUserId(validActivationToken.user_id);

  return response.status(200).json(usedActivationToken);
}
