const distance = (v1, v2) => {
    if (!v2.x) v2.x = 0
    if (!v2.y) v2.y = 0
    return Math.sqrt((v2.x - v1.x) * (v2.x - v1.x) + (v2.y - v1.y) * (v2.y - v1.y))
}
export default distance