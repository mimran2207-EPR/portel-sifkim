// Step ids are 0-based by module ("4.3" is in the 5th module); learners see the module's position.
export const stepLabel = (id: string) => id.replace(/^\d+/, (m) => String(Number(m) + 1));
