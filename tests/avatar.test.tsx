import { fireEvent, render, screen } from "@testing-library/react";
import AvatarPanel from "../src/components/AvatarPanel";
import * as narration from "../src/lib/narration";

const step = { id: "1.3", title: "קוד אימות", script: "עכשיו יישלח אליכם קוד אימות" };

afterEach(() => vi.restoreAllMocks());

describe("AvatarPanel playback order", () => {
  it("module opening video → the step's video → narration only if that fails", () => {
    const speak = vi.spyOn(narration, "narrate").mockImplementation(() => () => {});
    const onIntro = vi.fn();
    const { container } = render(<AvatarPanel step={step} introUrl="/avatar/m1.mp4" introText="פתיחה" onIntro={onIntro} narrate />);

    expect(container.querySelector("video")!.getAttribute("src")).toBe("/avatar/m1.mp4");
    expect(onIntro).toHaveBeenLastCalledWith(true);
    fireEvent.ended(container.querySelector("video")!);

    expect(container.querySelector("video")!.getAttribute("src")).toBe("/avatar/1.3.mp4");
    expect(onIntro).toHaveBeenLastCalledWith(false);
    expect(speak).not.toHaveBeenCalled();
    fireEvent.error(container.querySelector("video")!);

    expect(container.querySelector("video")).toBeNull();
    expect(speak).toHaveBeenCalledWith(step.id, step.script, expect.any(Object));
  });

  it("narrates straight away when there is no video and no intro", () => {
    const speak = vi.spyOn(narration, "narrate").mockImplementation(() => () => {});
    const { container } = render(<AvatarPanel step={step} narrate />);
    fireEvent.error(container.querySelector("video")!);
    expect(speak).toHaveBeenCalledTimes(1);
  });

  it("skips the video request for a step without a recorded video", () => {
    const speak = vi.spyOn(narration, "narrate").mockImplementation(() => () => {});
    const { container } = render(<AvatarPanel step={{ ...step, id: "9.9" }} narrate />);
    expect(container.querySelector("video")).toBeNull();
    expect(speak).toHaveBeenCalledTimes(1);
  });

  it("stays silent when narration is off", () => {
    const speak = vi.spyOn(narration, "narrate").mockImplementation(() => () => {});
    const { container } = render(<AvatarPanel step={step} narrate={false} />);
    fireEvent.error(container.querySelector("video")!);
    expect(speak).not.toHaveBeenCalled();
    expect(screen.getByText("🔇 קריינות כבויה")).toBeInTheDocument();
  });

  it("animates the avatar while speaking", () => {
    vi.spyOn(narration, "narrate").mockImplementation((_id, _t, h) => {
      h?.onStart?.();
      return () => {};
    });
    const { container } = render(<AvatarPanel step={step} narrate />);
    fireEvent.error(container.querySelector("video")!);
    expect(screen.getByAltText("אוהד מנקין, EPR מערכות")).toHaveAttribute("data-speaking", "true");
  });

  it("moves the mouth with the voice level", () => {
    let level: ((v: number) => void) | undefined;
    vi.spyOn(narration, "narrate").mockImplementation((_id, _t, h) => {
      level = h?.onLevel;
      return () => {};
    });
    const { container } = render(<AvatarPanel step={step} narrate />);
    fireEvent.error(container.querySelector("video")!);
    const card = container.querySelector(".avatar-3d") as HTMLElement;
    level?.(0.05);
    expect(card.dataset.mouth).toBe("0");
    level?.(0.2);
    expect(card.dataset.mouth).toBe("1");
    level?.(0.7);
    expect(card.dataset.mouth).toBe("2");
    expect(card.style.getPropertyValue("--lvl")).toBe("0.700");
  });

  it("a step video drives the caption and finishes the step", () => {
    const onWord = vi.fn();
    const onFinished = vi.fn();
    const { container } = render(<AvatarPanel step={step} narrate onWord={onWord} onFinished={onFinished} />);
    const video = container.querySelector("video")!;
    Object.defineProperty(video, "duration", { value: 10, configurable: true });
    Object.defineProperty(video, "currentTime", { value: 9.9, configurable: true });
    fireEvent.timeUpdate(video);
    expect(onWord).toHaveBeenLastCalledWith(4); // last of the 5 words
    fireEvent.ended(video);
    expect(onFinished).toHaveBeenCalledWith(true);
  });
});
