export const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN",{ day:"2-digit",month:"short",year:"numeric"}) : "-";
export const formatMonth = (d) => d ? new Date(d).toLocaleDateString("en-IN",{month:"short",year:"numeric"}) : "-";
