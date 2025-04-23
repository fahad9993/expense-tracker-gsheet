import { View } from "react-native";
import ContentLoader, { Circle, Rect } from "react-content-loader/native";

export default function DashboardSkeleton() {
  return (
    <View>
      <ContentLoader
        speed={2}
        width={372}
        height={756}
        viewBox="0 0 372 756"
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
      >
        <Rect x="25" y="50" rx="5" ry="5" width="80" height="100" />
        <Rect x="113" y="50" rx="5" ry="5" width="80" height="100" />
        <Rect x="201" y="50" rx="5" ry="5" width="80" height="100" />
        <Rect x="289" y="50" rx="5" ry="5" width="80" height="100" />
        <Rect x="30" y="550" rx="5" ry="5" width="329" height="30" />
        <Rect x="30" y="585" rx="5" ry="5" width="329" height="30" />
        <Rect x="30" y="620" rx="5" ry="5" width="329" height="30" />
        <Rect x="30" y="655" rx="5" ry="5" width="329" height="30" />
        <Rect x="30" y="690" rx="5" ry="5" width="329" height="30" />
        <Circle cx="199" cy="350" r="165" />
      </ContentLoader>
    </View>
  );
}
