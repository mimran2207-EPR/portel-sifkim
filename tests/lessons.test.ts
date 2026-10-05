import { modules, allSteps, findStep } from "../src/content/lessons";
test("ids unique and match N.M", () => {
  const ids = allSteps.map(s => s.id);
  expect(new Set(ids).size).toBe(ids.length);
  ids.forEach(id => expect(id).toMatch(/^\d+\.\d+$/));
});
test("every step has a Hebrew script of 20-90 words", () => {
  allSteps.forEach(s => {
    const words = s.script.trim().split(/\s+/).length;
    expect(words).toBeGreaterThanOrEqual(20);
    expect(words).toBeLessThanOrEqual(90);
    expect(s.script).toMatch(/[֐-׿]/);
  });
});
test("8 modules, findStep works", () => {
  expect(modules).toHaveLength(8);
  expect(findStep("4.5")?.module.id).toBe("4");
  expect(findStep("9.9")).toBeUndefined();
});
