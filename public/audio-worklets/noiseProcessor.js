class NoiseProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.noiseLevel = 0.05; //set default noise level
    }


    // base logic: noise la mot am thanh co song nhieu loan
    // (normal sound * random  = noise sound)

    process(inputs, outputs, parameters) {
        //input = input nodes , output
        const input =  inputs[0];
        const output = outputs[0];

        if (!input || input.length === 0) {
            return true; // No input, no processing
        }

        for(let channel = 0; channel < input.length; channel++){
            const inputChannel = input[channel];
            const outputChannel = output[channel];

            for(let i = 0; i < inputChannel.length; i++){
                // generate noise sound
                const noise =( Math.random()*2 - 1) * this.noiseLevel;
                outputChannel[i] = inputChannel[i] + noise;
            }

        }
        return true; // Keep processing
 
    }
   
}

registerProcessor('noise-processor', NoiseProcessor);
