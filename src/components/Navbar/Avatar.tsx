import React from "react";

const ProfileAvatar = React.memo(({ displayName }: { displayName?: string }) => {
  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="w-8 h-8 bg-gradient-to-br from-rosewood to-sienna rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
      {initials}
    </div>
  );
});

export default ProfileAvatar;
