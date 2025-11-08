import React, { useRef, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import * as ImageManipulator from "expo-image-manipulator";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import { getModel, base64ToInput, runPrediction } from "@/utils/tensorHelper";

const RESULT_MAPPING = ["rock", "paper", "scissor"];
const { height: DEVICE_HEIGHT, width: DEVICE_WIDTH } = Dimensions.get("window");
const MASK_DIM = 300;

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);

  const [photo, setPhoto] = useState<string | null>(null);
  const [presentGesture, setPresentGesture] = useState<string | null>(null);

  const [countdown, setCountdown] = useState<number | null>(null);
  const [computerChoice, setComputerChoice] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  

  const CHOICES: Record<number, string> = {
    1: "rock",
    2: "paper",
    3: "scissor",
  };

  const router = useRouter();
  const modelRef = useRef<tf.LayersModel | null>(null);

  // Load model once
  useEffect(() => {
    (async () => {
      await tf.ready();
      modelRef.current = await getModel();
    })();
  }, []);

  // Auto-capture loop
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!cameraRef.current || !modelRef.current) return;

      try {
        const photoResult: any = await cameraRef.current.takePictureAsync({
          quality: 0.3,
          skipProcessing: true,
          exif: true,
          base64: false,
          shutterSound: false,
        });

        setPhoto(photoResult.uri);

        const processed = await cropToSquare(photoResult, MASK_DIM);
        if (!processed?.base64) return;

        const input = base64ToInput(processed.base64);
        const preds = await runPrediction(modelRef.current, input);
        input.dispose();

        if (preds && preds.length) {
          const topIdx = preds.indexOf(Math.max(...preds));
          setPresentGesture(RESULT_MAPPING[topIdx]);
        }
      } catch (err) {
        console.log("Capture error:", err);
      }
    }, 700);

    return () => clearInterval(interval);
  }, []);

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted)
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera access is required.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );

  // GAME START LOGIC -------------------------------------
  const getWinner = (player: string, computer: string) => {
    if (player === computer) return "Draw";

    if (
      (player === "rock" && computer === "scissor") ||
      (player === "paper" && computer === "rock") ||
      (player === "scissor" && computer === "paper")
    ) {
      return "You Win!";
    }

    return "You Lose!";
  };

  const startGame = () => {
    setCountdown(3);
    setComputerChoice(null);
    setResult(null);

    let time = 3;

    const interval = setInterval(() => {
      time -= 1;
      setCountdown(time);

      if (time === 0) {
        clearInterval(interval);

        const randomNum = Math.floor(Math.random() * 3) + 1;
        const cChoice = CHOICES[randomNum];
        setComputerChoice(cChoice);

        const playerGesture = presentGesture;

        if (!playerGesture) {
          setResult("No gesture detected");
          return;
        }

        setResult(getWinner(playerGesture, cChoice));
      }
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="front" />

      <View style={styles.overlay}>
        <Text style={styles.title}>
          {presentGesture ? `Detected: ${presentGesture}` : "Detecting gesture..."}
        </Text>

        {photo && <Image source={{ uri: photo }} style={styles.preview} />}

        {/* START BUTTON */}
        <TouchableOpacity style={styles.startBtn} onPress={startGame}>
          <Text style={{ color: "white", fontSize: 18 }}>Start</Text>
        </TouchableOpacity>

        {/* Countdown */}
        {countdown !== null && (
          <Text style={{ color: "white", fontSize: 32 }}>{countdown}</Text>
        )}

        {/* Computer Choice */}


        {/* Result */}
        {result && (
          <View style={styles.popupOverlay}>
            <View style={styles.popup}>
              <Text style={styles.popupText}>{result}</Text>
                 {computerChoice && (
                   <Text style={{ color: "white", fontSize: 22 }}>
                     Computer chose: {computerChoice}
                   </Text>
                 )}                
              <TouchableOpacity
                style={styles.popupButton}
                onPress={() => {
                  setResult(null);
                  setComputerChoice(null);
                  setCountdown(null);
                }}
              >
                <Text style={styles.popupButtonText}>Play Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// IMAGE CROP ---------------------------------------
const cropToSquare = async (imageData: any, maskDimension: number) => {
  try {
    const { uri } = imageData;
    const width = imageData.width ?? DEVICE_WIDTH;
    const height = imageData.height ?? DEVICE_HEIGHT;

    const cropWidth = maskDimension * (width / DEVICE_WIDTH);
    const cropHeight = maskDimension * (height / DEVICE_HEIGHT);

    const actions = [
      {
        crop: {
          originX: width / 2 - cropWidth / 2,
          originY: height / 2 - cropHeight / 2,
          width: cropWidth,
          height: cropHeight,
        },
      },
      { resize: { width: 224, height: 224 } },
    ];

    return await ImageManipulator.manipulateAsync(uri, actions, {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    });
  } catch (e) {
    console.log("Could not crop & resize photo", e);
    return null;
  }
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  startBtn:{

  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 20,
  },
  title: {
    color: "#C084FC",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  preview: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginTop: 10,
  },
  backButton: {
    marginTop: 25,
  },
  backText: {
    color: "#C084FC",
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  permissionText: {
    color: "#C084FC",
    fontSize: 18,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#6D28D9",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  popupOverlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.7)",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
},

popup: {
  width: "75%",
  backgroundColor: "#222",
  padding: 25,
  borderRadius: 15,
  alignItems: "center",
  borderWidth: 2,
  borderColor: "#C084FC",
},

popupText: {
  color: "white",
  fontSize: 28,
  fontWeight: "bold",
  marginBottom: 20,
  textAlign: "center",
},

popupButton: {
  backgroundColor: "#C084FC",
  paddingVertical: 12,
  paddingHorizontal: 30,
  borderRadius: 10,
  marginTop: 10,
},

popupButtonText: {
  color: "white",
  fontSize: 18,
  fontWeight: "bold",
},

});
