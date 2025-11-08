import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import { bundleResourceIO, decodeJpeg } from "@tensorflow/tfjs-react-native";
import { Base64Binary } from "./utils";

const modelJson = require("../assets/model/model.json");
const modelWeights = require("../assets/model/group1-shard1of1.bin");

const IMG_SIZE = 224;

export const getModel = async () => {
  await tf.ready();
  return await tf.loadLayersModel(
    bundleResourceIO(modelJson, modelWeights)
  );
};

export const base64ToInput = (base64: string): tf.Tensor4D => {
  return tf.tidy(() => {
    const u8 = Base64Binary.decode(base64);
    const img = decodeJpeg(u8, 3);

    const resized = tf.image.resizeBilinear(
      img as tf.Tensor3D,
      [IMG_SIZE, IMG_SIZE]
    );

    const normalized = resized.toFloat().div(127.5).sub(1);

    return normalized.expandDims(0) as tf.Tensor4D;
  });
};

export const runPrediction = async (
  model: tf.LayersModel,
  input: tf.Tensor4D
) => {
  const output = model.predict(input) as tf.Tensor;
  const data = await output.data();
  output.dispose();
  return Array.from(data);
};
