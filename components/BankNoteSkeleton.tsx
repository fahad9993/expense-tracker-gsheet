import { View } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";

export default function BankNoteSkeleton() {
  return (
    <View>
      <ContentLoader
        speed={2}
        width={373}
        height={560}
        viewBox="0 0 373 560"
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
      >
        <Rect x="0" y="0" rx="5" ry="5" width="373" height="45" />
        <Rect x="0" y="55" rx="5" ry="5" width="373" height="45" />
        <Rect x="0" y="110" rx="5" ry="5" width="373" height="45" />
        <Rect x="0" y="165" rx="5" ry="5" width="373" height="45" />
        <Rect x="0" y="220" rx="5" ry="5" width="373" height="45" />
        <Rect x="0" y="275" rx="5" ry="5" width="373" height="45" />
        <Rect x="0" y="330" rx="5" ry="5" width="373" height="45" />
        <Rect x="0" y="385" rx="5" ry="5" width="373" height="45" />
        <Rect x="0" y="440" rx="5" ry="5" width="373" height="45" />
        <Rect x="0" y="495" rx="5" ry="5" width="373" height="45" />
      </ContentLoader>
    </View>
  );
}
