from __future__ import annotations

from pathlib import Path
import math

OUTPUT_DIR = Path("public") / "assets"
PNG_PATH = OUTPUT_DIR / "fathers-day-turtle.png"
EPS_PATH = OUTPUT_DIR / "fathers-day-turtle.eps"


def draw_with_turtle() -> bool:
    try:
        import turtle
    except Exception:
        return False

    try:
        screen = turtle.Screen()
        screen.setup(width=900, height=680)
        screen.bgcolor("#fff8ef")
        screen.title("Father's Day Turtle Sketch")
        screen.tracer(False)

        blue_turtle = turtle.Turtle()
        blue_turtle.shape("turtle")
        blue_turtle.speed(0)
        blue_turtle.pensize(4)
        blue_turtle.color("#184fd4")

        red_turtle = turtle.Turtle()
        red_turtle.shape("turtle")
        red_turtle.speed(0)
        red_turtle.pensize(4)
        red_turtle.color("#ec3434")
        red_turtle.penup()
        red_turtle.goto(260, 245)

        pen = blue_turtle

        def set_pen(next_pen: turtle.Turtle) -> None:
            nonlocal pen
            pen = next_pen

        def move(x: float, y: float) -> None:
            pen.penup()
            pen.goto(x, y)
            pen.pendown()

        def line(x1: float, y1: float, x2: float, y2: float) -> None:
            move(x1, y1)
            pen.goto(x2, y2)

        def circle(x: float, y: float, radius: float, color: str = "#4d3426") -> None:
            pen.color(color)
            move(x, y - radius)
            pen.circle(radius)
            pen.color("#4d3426")

        def write(text: str, x: float, y: float, size: int, color: str = "#4d3426") -> None:
            pen.color(color)
            pen.penup()
            pen.goto(x, y)
            pen.write(text, align="center", font=("Arial", size, "bold"))
            pen.color("#4d3426")

        def draw_heart(cx: float, cy: float, scale: float) -> None:
            pen.color("#d95d59")
            pen.pensize(5)
            move(cx, cy)
            pen.setheading(140)
            pen.forward(58 * scale)
            for _ in range(185):
                pen.right(1)
                pen.forward(0.55 * scale)
            pen.setheading(60)
            for _ in range(185):
                pen.right(1)
                pen.forward(0.55 * scale)
            pen.forward(58 * scale)
            pen.pensize(4)
            pen.color("#4d3426")

        # Sun
        set_pen(blue_turtle)
        pen.color("#e6a84a")
        circle(-320, 220, 44, "#e6a84a")
        for angle in range(0, 360, 30):
            start_x = -320 + math.cos(math.radians(angle)) * 62
            start_y = 220 + math.sin(math.radians(angle)) * 62
            end_x = -320 + math.cos(math.radians(angle)) * 86
            end_y = 220 + math.sin(math.radians(angle)) * 86
            line(start_x, start_y, end_x, end_y)

        # Grass
        pen.color("#5f8d57")
        pen.pensize(3)
        for x in range(-390, 391, 28):
            line(x, -210, x + 9, -178)
            line(x + 9, -178, x + 20, -210)

        # Dad stick figure
        pen.color("#4d3426")
        pen.pensize(5)
        circle(-80, 80, 38)
        line(-80, 42, -80, -75)
        line(-80, 8, -155, -35)
        line(-80, 8, -5, -35)
        line(-80, -75, -135, -170)
        line(-80, -75, -20, -170)

        # Child stick figure
        pen.pensize(4)
        circle(112, 35, 28)
        line(112, 7, 112, -78)
        line(112, -18, 52, -46)
        line(112, -18, 165, -58)
        line(112, -78, 72, -158)
        line(112, -78, 152, -158)

        # Holding hands
        pen.pensize(5)
        line(-5, -35, 52, -46)

        set_pen(red_turtle)
        draw_heart(16, 166, 1.05)
        write("Dad", 18, 245, 42, "#68472f")
        write("Happy Father's Day", 18, -285, 30, "#68472f")

        screen.update()
        canvas = screen.getcanvas()
        canvas.postscript(file=str(EPS_PATH), colormode="color")
        turtle.bye()
        return True
    except Exception:
        try:
            turtle.bye()
        except Exception:
            pass
        return False


def make_png_fallback() -> None:
    from PIL import Image, ImageDraw, ImageFont

    image = Image.new("RGB", (900, 680), "#fff8ef")
    draw = ImageDraw.Draw(image)

    brown = "#4d3426"
    warm = "#68472f"
    red = "#d95d59"
    green = "#5f8d57"
    gold = "#e6a84a"

    def font(size: int):
        for name in ("arial.ttf", "Arial.ttf"):
            try:
                return ImageFont.truetype(name, size)
            except OSError:
                continue
        return ImageFont.load_default()

    def centered(text: str, y: int, size: int, color: str) -> None:
        fnt = font(size)
        bbox = draw.textbbox((0, 0), text, font=fnt)
        draw.text(((900 - bbox[2]) / 2, y), text, fill=color, font=fnt)

    # Sun and rays
    draw.ellipse((86, 96, 174, 184), outline=gold, width=5)
    for angle in range(0, 360, 30):
        x1 = 130 + math.cos(math.radians(angle)) * 62
        y1 = 140 + math.sin(math.radians(angle)) * 62
        x2 = 130 + math.cos(math.radians(angle)) * 86
        y2 = 140 + math.sin(math.radians(angle)) * 86
        draw.line((x1, y1, x2, y2), fill=gold, width=4)

    # Grass
    for x in range(60, 840, 28):
        draw.line((x, 560, x + 9, 528, x + 20, 560), fill=green, width=3)

    # Dad
    draw.ellipse((332, 212, 408, 288), outline=brown, width=5)
    draw.line((370, 288, 370, 405), fill=brown, width=5)
    draw.line((370, 330, 295, 373), fill=brown, width=5)
    draw.line((370, 330, 445, 373), fill=brown, width=5)
    draw.line((370, 405, 315, 500), fill=brown, width=5)
    draw.line((370, 405, 430, 500), fill=brown, width=5)

    # Child
    draw.ellipse((534, 250, 590, 306), outline=brown, width=4)
    draw.line((562, 306, 562, 391), fill=brown, width=4)
    draw.line((562, 331, 502, 359), fill=brown, width=4)
    draw.line((562, 331, 615, 371), fill=brown, width=4)
    draw.line((562, 391, 522, 471), fill=brown, width=4)
    draw.line((562, 391, 602, 471), fill=brown, width=4)
    draw.line((445, 373, 502, 359), fill=brown, width=5)

    # Heart
    heart = [(450, 150), (390, 93), (335, 145), (450, 252), (565, 145), (510, 93)]
    draw.line(heart + [heart[0]], fill=red, width=5, joint="curve")

    centered("Dad", 180, 44, warm)
    centered("Happy Father's Day", 585, 34, warm)

    image.save(PNG_PATH)


def convert_eps_to_png() -> bool:
    try:
        from PIL import Image

        with Image.open(EPS_PATH) as image:
            image.load(scale=2)
            image.convert("RGB").save(PNG_PATH)
        return True
    except Exception:
        return False


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    turtle_ok = draw_with_turtle()

    if turtle_ok and EPS_PATH.exists() and convert_eps_to_png():
        print(f"Created {PNG_PATH} from turtle EPS export.")
        return

    make_png_fallback()
    if turtle_ok:
        print(f"Created {EPS_PATH} and fallback PNG at {PNG_PATH}.")
    else:
        print(f"Turtle display export was unavailable; created fallback PNG at {PNG_PATH}.")


if __name__ == "__main__":
    main()
