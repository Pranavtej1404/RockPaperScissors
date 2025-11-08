
# 🪨📄✂️ Rock–Paper–Scissors Gesture Game (React Native + TensorFlow.js)

A mobile Rock–Paper–Scissors game powered by **real-time hand-gesture recognition** using **Expo Camera** and a **TensorFlow.js MobileNetV2 model**.

The app detects whether you show **rock**, **paper**, or **scissor**, then compares it with a randomly generated computer move after a countdown — displaying win, lose, or draw using a clean popup UI.

---

## 🚀 Features

* 🎥 **Real-time gesture detection** using the front camera
* 🤖 **MobileNetV2-based TensorFlow.js model** for fast predictions
* 🧠 **On-device inference** — works offline
* 🎮 **3-second countdown gameplay**
* 🖥 **Popup results** (win/lose/draw) with Play Again button
* ⚡ Optimized frame capture & preprocessing
* 📱 Built with Expo Router + TypeScript

---

## 🧠 Model Details

* Architecture: **MobileNetV2 + Custom Dense Classifier**
* Input: **224 × 224 × 3**
* Output classes:

  * Rock
  * Paper
  * Scissor
* Exported using **TensorFlow.js converter**
* Loaded on-device using:

  ```ts
  tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights))
  ```

---

## 📂 Project Structure

```
StonePaperScissors/
│
├── frontend/               # Expo React Native app
│   ├── app/                # Screens
│   ├── assets/             
│   │   └── model/          # TFJS model.json + shard .bin files
│   ├── utils/              # Tensor helper functions
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

---

## 🛠 Tech Stack

* **React Native (Expo)**
* **Expo Camera**
* **TensorFlow.js / tfjs-react-native**
* **TypeScript**
* **ImageManipulator** for resizing/cropping frames
* **Expo Router**

---

## ▶️ How to Run

### 1. Install dependencies

```sh
cd frontend
npm install
```

### 2. Start the Expo app

```sh
npm run start
```

### 3. Open on your device

Use **Expo Go** or a simulator.

---

## 🎮 Gameplay Flow

1. App detects your hand gesture live
2. Press **Start**
3. A **3-second countdown** begins
4. At second 0, the app:

   * Reads your gesture
   * Generates a random computer choice
5. A popup displays the result
6. Press **Play Again** to restart

---

