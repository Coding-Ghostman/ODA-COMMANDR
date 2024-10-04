const genai = require('oci-generativeaiinference');
const common = require('oci-common');

async function generateAIResponse(client, logger, userMessage, compartmentId) {
	try {
		const modelId = 'cohere.command-r-plus';
		// const modelId ='ocid1.generativeaimodel.oc1.eu-frankfurt-1.amaaaaaask7dceyaazssnpqc7g4rxwlvcfehpcfbtdvvkftz3jzz5pf4tenq';
		const prompt = userMessage;
		const max_tokens = 1800;
		const temperature = 0;
		const top_p = 0.7;

		const serving_mode = {
			modelId: modelId,
			servingType: 'ON_DEMAND',
		};

		const inference_request = {
			message: prompt,
			apiFormat: 'COHERE',
			maxTokens: max_tokens,
			temperature: temperature,
			documents: [],
			chatHistory: [],
			topP: top_p,
		};
		
		const chatDetails = {
			compartmentId: compartmentId,
			servingMode: serving_mode,
			chatRequest: inference_request,
		};

		logger.info('CUSTOM_Check_GenAi: ', chatDetails);

		// Send request to the Client.
		const chatResponse = await client.chat({ chatDetails: chatDetails });
		return chatResponse;
	} catch (error) {
		logger.error('chat Failed with error  ' + error);
		throw error;
	}
}

module.exports = {
	metadata: {
		name: 'CUSTOM_Check_GenAi',
		properties: {},
		supportedActions: [],
	},
	invoke: async (context, done) => {
		// const authenticationProvider = await new common.InstancePrincipalsAuthenticationDetailsProviderBuilder().build();
		const authenticationProvider = new common.ResourcePrincipalAuthenticationDetailsProvider();
		const configFile = '~/.oci/config';
		const configProfile = 'DEFAULT';
		// const authenticationProvider =
		// 	new common.ConfigFileAuthenticationDetailsProvider(
		// 		configFile,
		// 		configProfile
		// 	);
		const userMessage = context.getUserMessage();
		const logger = context.logger();
		logger.info('CUSTOM_Check_GenAi: ', userMessage.text);
		try {
			const client = new genai.GenerativeAiInferenceClient({
				authenticationDetailsProvider: authenticationProvider,
			});
			const compartmentId ='ocid1.compartment.oc1..aaaaaaaacdv3ig7yho6ebvdm6p5cdxq74pgnugeankt25mebpxoyhar2n4pa';
			// const compartmentId ='ocid1.compartment.oc1..aaaaaaaa34qokt6zlatj6uiokyv3f4rkyk5r2rtpjzgbabfme6h5e7epmyqa';

			const chatResponse = await generateAIResponse(
				client,
				logger,
				userMessage.text,
				compartmentId
			);
			context.setVariable(
				'genAiResponse',
				chatResponse.chatResult.chatResponse.text
			);
			logger.info(
				'CUSTOM_Check_GenAi: ',
				chatResponse.chatResult.chatResponse.text
			);
		} catch (error) {
			logger.error('chat Failed with error  ' + error);
		}

		context.transition();
		done();
	},
};
