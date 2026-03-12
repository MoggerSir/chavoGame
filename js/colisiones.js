export const chackCollision = (obj1, obj2, padding = 15) => {
    const rect1 = obj1.getBoundingClientRect();
    const rect2 = obj2.getBoundingClientRect();

    return !(
        (rect1.top + padding) > (rect2.bottom - padding) ||
        (rect1.bottom - padding) < (rect2.top + padding) ||
        (rect1.left + padding) > (rect2.right - padding) ||
        (rect1.right - padding) < (rect2.left + padding)
    );
};
