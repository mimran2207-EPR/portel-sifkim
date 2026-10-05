import { fireEvent, render, screen } from "@testing-library/react";
import AvatarPanel from "../src/components/AvatarPanel";
import * as speech from "../src/lib/speech";

const step = { id: "1.1", title: "בחירת רשות", script: "נתחיל בכניסה לפורטל" };

afterEach(() => vi.restoreAllMocks());

describe("AvatarPanel playback order", () => {
  it("step video → module intro video → narration", () => {
    const speak = vi.spyOn(speech, "speak").mockImplementation(() => {});
    const { container } = render(<AvatarPanel step={step} introUrl="/avatar/m1.mp4" narrate />);

    expect(container.querySelector("video")!.getAttribute("src")).toBe("/avatar/1.1.mp4");
    fireEvent.error(container.querySelector("video")!);

    expect(container.querySelector("video")!.getAttribute("src")).toBe("/avatar/m1.mp4");
    expect(speak).not.toHaveBeenCalled();
    fireEvent.ended(container.querySelector("video")!);

    expect(container.querySelector("video")).toBeNull();
    expect(speak).toHaveBeenCalledWith(step.script, expect.any(Object));
  });

  it("narrates straight away when there is no video and no intro", () => {
    const speak = vi.spyOn(speech, "speak").mockImplementation(() => {});
    const { container } = render(<AvatarPanel step={step} narrate />);
    fireEvent.error(container.querySelector("video")!);
    expect(speak).toHaveBeenCalledTimes(1);
  });

  it("stays silent when narration is off", () => {
    const speak = vi.spyOn(speech, "speak").mockImplementation(() => {});
    const { container } = render(<AvatarPanel step={step} narrate={false} />);
    fireEvent.error(container.querySelector("video")!);
    expect(speak).not.toHaveBeenCalled();
    expect(screen.getByTestId("speech-bubble")).toHaveTextContent(step.script);
  });

  it("animates the avatar while speaking", () => {
    vi.spyOn(speech, "speak").mockImplementation((_t, h) => h?.onStart?.());
    const { container } = render(<AvatarPanel step={step} narrate />);
    fireEvent.error(container.querySelector("video")!);
    expect(screen.getByAltText("יהודה, מנהל הדיגיטל")).toHaveAttribute("data-speaking", "true");
  });
});
