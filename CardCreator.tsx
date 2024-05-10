import {Canvas, MeshProps} from "@react-three/fiber";
import {Color, MeshStandardMaterial, Texture} from "three";
import useControls from "r3f-native-orbitcontrols";
import {View} from "react-native";
import {useState} from "react";
import {TextureLoader} from "expo-three";
import * as ImagePicker from "expo-image-picker";

enum TextureFacePosition {
  CornerRight,
  CornerLeft,
  CornerTop,
  CornerBottom,
  Front,
  Back
}

export const CardCreatorCanvas = () => {
  const [OrbitControls, events] = useControls()
  const {frontTexture, backTexture, handleChangeFaceTexture} = useCardFacePicker()

  return (
    <View {...events} style={{
      flex: 1,
      backgroundColor: "black",
    }}>
      <Canvas>
        <OrbitControls/>
        <ambientLight intensity={.2}/>
        <pointLight intensity={.5} position={[20, 20, 20]}/>
        <pointLight intensity={.5} position={[-20, -20, -20]}/>
        <Box onPressFace={handleChangeFaceTexture} cornerColor="#fff" backTexture={backTexture}
             frontTexture={frontTexture} position={[0, 0, 0]}/>
      </Canvas>
    </View>
  );
}

function Box({cornerColor, frontTexture, backTexture, onPressFace, ...props}: MeshProps & {
  cornerColor: Color | string,
  frontTexture: Texture,
  backTexture: Texture,
  onPressFace: (faceIndex: TextureFacePosition) => void
}) {
  const material = new MeshStandardMaterial({color: cornerColor});
  const frontMaterial = new MeshStandardMaterial({map: frontTexture});
  const backMaterial = new MeshStandardMaterial({map: backTexture});

  return (
    <mesh
      {...props}
      scale={[1.5, 1.5, 1.5]}
      material={[
        material,
        material,
        material,
        material,
        frontMaterial,
        backMaterial,
      ]}
      onClick={(e) => onPressFace(e.face.materialIndex)}
    >
      <boxGeometry
        attach="geometry" args={
        [2, 1.5, .05]
      }/>
    </mesh>
  );
}

const useCardFacePicker = () => {
  const [frontTexture, setFrontTexture] = useState<Texture>(new TextureLoader().load(require('./default-front.png')));
  const [backTexture, setBackTexture] = useState<Texture>(new TextureLoader().load(require('./default-back.png')));

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
  };

  const handleChangeFaceTexture = async (faceIndex: TextureFacePosition) => {
    switch (faceIndex) {
      case TextureFacePosition.Front:
        const front = await pickImage()
        setFrontTexture(new TextureLoader().load(front))
        break;
      case TextureFacePosition.Back:
        const back = await pickImage()
        setBackTexture(new TextureLoader().load(back))
        break;
      default:
        break;
    }
  }

  return {
    handleChangeFaceTexture,
    frontTexture,
    backTexture
  }
}
