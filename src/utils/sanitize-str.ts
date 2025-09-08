export function sanitazeStr(str: String) : String {
    return !str || !str.toString ? "" : str.trim().normalize();
}