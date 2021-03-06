import {defs, tiny} from './examples/common.js';

// Pull these names into this module's scope for convenience:
const {Vector, vec3, vec4, vec, color, Matrix, Mat4, Light, Shape, Material, Shader, Texture, Scene} = tiny;
const {Cube, Axis_Arrows, Textured_Phong, Phong_Shader, Basic_Shader, Subdivision_Sphere, Cylindrical_Tube} = defs

import {Shape_From_File} from './examples/obj-file-demo.js'
import {Color_Phong_Shader, Shadow_Textured_Phong_Shader,
    Depth_Texture_Shader_2D, Buffered_Texture, LIGHT_DEPTH_TEX_SIZE} from './examples/shadow-demo-shaders.js'

// 2D shape, to display the texture buffer
const Square =
    class Square extends tiny.Vertex_Buffer {
        constructor() {
            super("position", "normal", "texture_coord");
            this.arrays.position = [
                vec3(0, 0, 0), vec3(1, 0, 0), vec3(0, 1, 0),
                vec3(1, 1, 0), vec3(1, 0, 0), vec3(0, 1, 0)
            ];
            this.arrays.normal = [
                vec3(0, 0, 1), vec3(0, 0, 1), vec3(0, 0, 1),
                vec3(0, 0, 1), vec3(0, 0, 1), vec3(0, 0, 1),
            ];
            this.arrays.texture_coord = [
                vec(0, 0), vec(1, 0), vec(0, 1),
                vec(1, 1), vec(1, 0), vec(0, 1)
            ]
        }
    }

// The scene
export class LofiScene extends Scene {
    constructor() {
        super();
        // Load the model file:
        this.shapes = {
            "teapot": new Shape_From_File("assets/teapot.obj"),
            "sphere": new Subdivision_Sphere(6),
            "cube": new Cube(),
            "square_2d": new Square(),
            cup: new Cylindrical_Tube(15,15),
            circle: new defs.Regular_2D_Polygon(1, 15),
            sphere4: new defs.Subdivision_Sphere(4),
            comps: new Cube(),
            moon: new defs.Subdivision_Sphere(4),

        };
        console.log(this.shapes.comps.arrays.texture_coord)

        console.log(this.shapes.comps.arrays.texture_coord)

        this.materials = {
            sun: new Material(new defs.Phong_Shader(),
                {ambient: 1, color: color(1,1,1,1)}), 
            moon: new Material(new defs.Phong_Shader(),
                 {ambient: 0, color: color(0.792, 0.792, 0.792, 1)}),  
        }

        // For the teapot
        this.stars = new Material(new Shadow_Textured_Phong_Shader(1), {
            color: color(.5, .5, .5, 1),
            ambient: .4, diffusivity: .5, specularity: .5,
            color_texture: new Texture("assets/stars.png"),
            light_depth_texture: null

        });
        // For the floor or other plain objects
        this.floor = new Material(new Shadow_Textured_Phong_Shader(1), {
            color: color(1, 1, 1, 1), ambient: .3, diffusivity: 0.6, specularity: 0.4, smoothness: 64,
            color_texture: null,
            light_depth_texture: null
        })
        // For the first pass
        this.pure = new Material(new Color_Phong_Shader(), {
        })
        // For light source
        this.light_src = new Material(new Phong_Shader(), {
            color: color(1, 1, 1, 1), ambient: 1, diffusivity: 0, specularity: 0
        });
        // For depth texture display
        this.depth_tex =  new Material(new Depth_Texture_Shader_2D(), {
            color: color(0, 0, .0, 1),
            ambient: 1, diffusivity: 0, specularity: 0, texture: null
        });

        // --------------------------------------------------------------------------------

        // book_filling
        this.book_filling = new Material(new Shadow_Textured_Phong_Shader(1),
                {ambient: 0.6, diffusivity: .6, color: color(1,1,1,1), smoothness: 64,
            color_texture: null,
            light_depth_texture: null
        }),

        // book_1_cover
        this.book_1_cover = new Material(new Shadow_Textured_Phong_Shader(1),
                {ambient: 0.2, diffusivity: .6, color: color(0.8431, 0.0588, 0.0588,1), smoothness: 64,
            color_texture: null,
            light_depth_texture: null
        }),

        // wood
        this.wood = new Material(new Shadow_Textured_Phong_Shader(1),
                {ambient: 0.2, diffusivity: 0.8, specularity: 0.3, color: color(0.4,0.2,0,1), smoothness: 64,
            color_texture: null,
            light_depth_texture: null
        }),

        // ceramic
        this.ceramic = new Material(new Shadow_Textured_Phong_Shader(1),
                {ambient: 0.7, diffusivity: 0.6, specularity: 0.3, color: color(1,0.95,0.9,1), smoothness: 64,
            color_texture: null,
            light_depth_texture: null
        }),
        
        // screen
        this.screen = new Material(new Textured_Phong(), {
                 color: color(0,0,0,1),
                 ambient: 1, diffusivity: 0.1, specularity: 0.1,
                 texture: new Texture("assets/lofi.png", "NEAREST")
             }),

        // metal
        this.bmetal = new Material(new Shadow_Textured_Phong_Shader(),
             {ambient: 0.6, diffusivity: 0.6, specularity: 0.7, color: color(0,0,0,1)}),

        // painting 1
        this.painting_1 = new Material(new Textured_Phong(), {
                 color: color(0,0,0,1),
                 ambient: 1, diffusivity: 0.1, specularity: 0.1,
                 texture: new Texture("assets/squidward.jpeg", "NEAREST")
             }),

        this.rug = new Material(new Shadow_Textured_Phong_Shader(1), {
            color: color(0.2,0.2,0.2,1),
            ambient: 0.3, diffusivity: 0.6, specularity: 0.4, smoothness:64,
            color_texture: new Texture("assets/city_rug.jpg"),
            light_depth_texture: null
        })

        this.bed = new Material(new Shadow_Textured_Phong_Shader(1), {
            color: color(0,0,0,1),
            ambient: 0.7, diffusivity: 0.3, specularity: 0.1,
            color_texture: new Texture("assets/bed.jpg"),
            light_depth_texture: null
        })

        this.pillow = new Material(new Shadow_Textured_Phong_Shader(1), {
            color: color(0.1,0.1,0.1,1),
            ambient: 0.7, diffusivity: 0.3, specularity: 0.1,
            color_texture: new Texture("assets/pillow.jpg"),
            light_depth_texture: null
        })

        this.painting_2 = new Material(new Textured_Phong(), {
            color: color(0,0,0,1),
            ambient: 0.8, diffusivity: 0.1, specularity: 0.1,
            texture: new Texture("assets/ucla.jpg", "NEAREST")
        })

        // flooring
        this.flooring = new Material(new Shadow_Textured_Phong_Shader(1), {
            color: color(0.5, 0.5, 0.5, 1),
            ambient: 0.3,
            diffusivity: 0.6,
            specularity: 0.4,
            color_texture: new Texture("assets/wooden_flooring.jpg", "NEAREST"),
            light_depth_texture: null
        })

        // walls
        this.wall = new Material(new Shadow_Textured_Phong_Shader(1), {
            color: color(0.6, 0.6, 0.6, 1),
            ambient: 0.3,
            diffusivity: 0.6,
            specularity: 0.4,
            color_texture: new Texture("assets/wall.png"),
            light_depth_texture: null
        })

        // ---------------------------------------------------------------------------------

        // To make sure texture initialization only does once
        this.init_ok = false;

        this.toggle = {
            ball: true,
            table: true,
            book: true,
            chair: true,
            mug: true,
            computer: true,
            notebook: true,
            time: true,
            noon: false,
            midnight: false,
            bed: true,
        }

        // Used for timing
        this.first_entry = true;
        this.old_time = 0;
        this.lapsed_time = 0;

        // Used for setting time
        this.noon = 1.2;
        this.midnight = 5;
        this.time_adjust = 0;
        this.first_set = false;
        // this.debugtime = 0;

        // Used for camera work
        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 35), vec3(0, 6, 0), vec3(0, 1, 0));
        this.starting_camera_location = Mat4.look_at(vec3(0, 10, 35), vec3(0, 6, 0), vec3(0, 1, 0));
        this.top_right_camera_location = Mat4.look_at(vec3(35, 30, 35), vec3(0, 4, 0), vec3(0, 1, 0));
        this.top_left_camera_location = Mat4.look_at(vec3(-35, 30, 35), vec3(0, 4, 0), vec3(0, 1, 0));
    }

    make_control_panel() {
        this.key_triggered_button("Toggle Table", ["Control", "0"], () => this.toggle.table = !this.toggle.table);
        this.key_triggered_button("Toggle Chair", ["Control", "1"], () => this.toggle.chair = !this.toggle.chair);
        this.new_line();
        this.key_triggered_button("Toggle Book", ["Control", "2"], () => this.toggle.book = !this.toggle.book);
        this.key_triggered_button("Toggle Mug", ["Control", "3"], () => this.toggle.mug = !this.toggle.mug);
        this.new_line();
        this.key_triggered_button("Toggle Computer", ["Control", "4"], () => this.toggle.computer = !this.toggle.computer);
        this.key_triggered_button("Toggle Notebook", ["Control", "5"], () => this.toggle.notebook = !this.toggle.notebook);
        this.key_triggered_button("Toggle Bed", ["Control", "6"], () => this.toggle.bed = !this.toggle.bed);
        this.key_triggered_button("Return to Original View", ["Control", "7"], () => this.attached = () => this.starting_camera_location);
        this.key_triggered_button("Switch to Light's POV", ["Control", "8"], () => this.attached = () => this.light_pov);
        this.key_triggered_button("Switch to Top-Right POV", ["Control", "r"], () => this.attached = () => this.top_right_camera_location)
        this.key_triggered_button("Switch to Top-Left POV", ["Control", "l"], () => this.attached = () => this.top_left_camera_location)
        this.key_triggered_button("Pause / Unpause time", ["t"], () => {
            this.toggle.time = !this.toggle.time
            this.first_entry = true;
        });
        this.key_triggered_button("Set to noon", ["Control", "s"], () => {
            this.first_set = true;
            this.toggle.noon = true;
        })
        this.key_triggered_button("Set to midnight", ["Control", "m"], () => {
            this.first_set = true;
            this.toggle.midnight = true;
        })
        // this.key_triggered_button("log time", ["Control", "a"], () => {
        //     console.log(this.debugtime)
        // })
    }

    texture_buffer_init(gl) {
        // Depth Texture
        this.lightDepthTexture = gl.createTexture();
        // Bind it to TinyGraphics
        this.light_depth_texture = new Buffered_Texture(this.lightDepthTexture);
        this.stars.light_depth_texture = this.light_depth_texture
        this.floor.light_depth_texture = this.light_depth_texture
        this.flooring.light_depth_texture = this.light_depth_texture
        this.rug.light_depth_texture = this.light_depth_texture
        this.wood.light_depth_texture = this.light_depth_texture
        this.wall.light_depth_texture = this.light_depth_texture
        this.ceramic.light_depth_texture = this.light_depth_texture
        this.book_1_cover.light_depth_texture = this.light_depth_texture
        this.bed.light_depth_texture = this.light_depth_texture
        this.pillow.light_depth_texture = this.light_depth_texture


        this.lightDepthTextureSize = LIGHT_DEPTH_TEX_SIZE;
        gl.bindTexture(gl.TEXTURE_2D, this.lightDepthTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,      // target
            0,                  // mip level
            gl.DEPTH_COMPONENT, // internal format
            this.lightDepthTextureSize,   // width
            this.lightDepthTextureSize,   // height
            0,                  // border
            gl.DEPTH_COMPONENT, // format
            gl.UNSIGNED_INT,    // type
            null);              // data
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Depth Texture Buffer
        this.lightDepthFramebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightDepthFramebuffer);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,       // target
            gl.DEPTH_ATTACHMENT,  // attachment point
            gl.TEXTURE_2D,        // texture target
            this.lightDepthTexture,         // texture
            0);                   // mip level
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // create a color texture of the same size as the depth texture
        // see article why this is needed_
        this.unusedTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.unusedTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            this.lightDepthTextureSize,
            this.lightDepthTextureSize,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null,
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // attach it to the framebuffer
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,        // target
            gl.COLOR_ATTACHMENT0,  // attachment point
            gl.TEXTURE_2D,         // texture target
            this.unusedTexture,         // texture
            0);                    // mip level
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    render_scene(context, program_state, shadow_pass, draw_light_source=false, draw_shadow=false) {
        // shadow_pass: true if this is the second pass that draw the shadow.
        // draw_light_source: true if we want to draw the light source.
        // draw_shadow: true if we want to draw the shadow

        let light_position = this.light_position;
        let light_color = this.light_color;
        let t;
        if (this.toggle.time) {
            if(this.first_entry) {
                this.first_entry = false;
                this.lapsed_time = program_state.animation_time / 1000 - this.old_time
            }
            t = program_state.animation_time / 1000 - this.lapsed_time;
        }
        else {
            if(this.first_entry) {
                this.first_entry = false;
                this.old_time = program_state.animation_time / 1000 - this.lapsed_time;
            }
            t = this.old_time;
        }
        if (this.first_set) {
            this.first_set = false;
            if(this.toggle.noon) {
                this.time_adjust = t - this.noon;
                this.toggle.noon = false;
            }
            if(this.toggle.midnight) {
                this.time_adjust = t - this.midnight;
                this.toggle.midnight = false;
            }
        }
        t = t - this.time_adjust

        program_state.draw_shadow = draw_shadow;
        
        // --------------------------------------------------------------------------------------------
        const light_rotation_matrix = Mat4.rotation(t, 0, 0, 1);
        let model_transform = Mat4.identity();
        // drawing the sun
        if (draw_light_source && shadow_pass)
        {
            const sun_radius = 2 + Math.sin(2 * Math.PI * t / 10);
            const sun_color = color(1, (sun_radius / 2 - 0.5), (sun_radius / 2 - 0.5), 1);
            let model_transform_sun = model_transform.times(light_rotation_matrix)
                .times(Mat4.scale(2, 2, 2))
                .times(Mat4.translation(10,3,-10));
            this.shapes.sphere4.draw(context, program_state, model_transform_sun, this.materials.sun.override({color: sun_color}));
        }

        // drawing the moon
        let model_transform_moon = model_transform.times(light_rotation_matrix)
             .times(Mat4.scale(2, 2, 2))
             .times(Mat4.translation(-10,3,-10));
         this.shapes.moon.draw(context, program_state, model_transform_moon, this.materials.moon);

        // Table
        let model_transform_leg = model_transform.times(Mat4.translation(0, -6, 0))
            .times(Mat4.scale(0.5,3,0.5));
        let model_transform_counter = model_transform.times(Mat4.translation(-2.5, -2.5, -2.5))
            .times(Mat4.scale(8,0.5,5));

        // Chair
        let model_transform_ch_leg = model_transform.times(Mat4.translation(12, -7, 1))
            .times(Mat4.scale(0.5,2,0.5));
        let model_transform_seat = model_transform.times(Mat4.translation(10.5, -4.75, -1))
            .times(Mat4.scale(3,0.3,3));
        let model_transform_back = model_transform.times(Mat4.translation(13.2, -1, -1))
            .times(Mat4.scale(0.3, 4,3));
        let model_transform_arm = model_transform.times(Mat4.translation(7.8, -3.5, 1.7))
            .times(Mat4.scale(0.3,1,0.3));
        let model_transform_armrest = model_transform.times(Mat4.translation(10.5, -2.25, 1.7))
            .times(Mat4.scale(3,0.3,0.3));

        // Book
        let model_transform_book1 = model_transform.times(Mat4.translation(-3, -1.8, 0))
            .times(Mat4.scale(1, 0.15, 1.5));
        let model_transform_book1_bottom = model_transform_book1.times(Mat4.scale(1.1, 0.2, 1.1))
            .times(Mat4.translation(0.05, -6, 0));
        let model_transform_book1_top = model_transform_book1_bottom.times(Mat4.translation(0, 12, 0));
        let model_transform_book1_binding = model_transform.times(Mat4.translation(-3.945, -1.8, 0))
            .times(Mat4.scale(0.10, 0.16, 1.65));

        // Mug
        let mug_model_transform = model_transform.times(Mat4.scale(0.68,1.5,0.68))
                                                 .times(Mat4.rotation(4.71239,1,0,0))
                                                 .times(Mat4.translation(-10.295,0,-0.828));
        let mug_base_model_transform = model_transform//.times(Mat4.scale(1,1,1))
                                                      .times(Mat4.rotation(4.71239,1,0,0))
                                                      .times(Mat4.translation(-7,0,-1.89)).times(Mat4.scale(0.68,0.68,1));
        // DAY: 91, 206, 245
        // NIGHT: 13, 28, 33

        let sinvar = t - Math.PI / 15
        let bg_colorR = ((13 + 39 * Math.sin(sinvar)) % 91) / 255
        let bg_colorG = ((28 + 89 * Math.sin(sinvar)) % 206) / 255
        let bg_colorB = ((33 + 106 * Math.sin(sinvar)) % 245) / 255

        let background_color = color(bg_colorR, bg_colorG, bg_colorB, 1)
        // Background
        let model_transform_background = model_transform.times(Mat4.translation(0, 11, -200))
          .times(Mat4.scale(4000,4000,0.1));

        // Room
        let model_transform_floor = model_transform.times(Mat4.translation(0, -9.7, 25))
            .times(Mat4.scale(40,0.7,40));
        let model_transform_ceiling = model_transform.times(Mat4.translation(0, 31, 25))
            .times(Mat4.scale(40,0.7,40));
        let model_transform_left_wall = model_transform.times(Mat4.translation(-40, 11, 25))
            .times(Mat4.scale(0.7, 20, 40));
        let model_transform_right_wall = model_transform.times(Mat4.translation(40, 11, 25))
            .times(Mat4.scale(0.7, 20, 40));
        let model_transform_front_wall = model_transform.times(Mat4.translation(0, 11, 40))
            .times(Mat4.scale(40, 20, 0.7));
        let model_transform_back_wall_top = model_transform.times(Mat4.translation(0, 26, -15.6))
            .times(Mat4.scale(20, 5, 0.7));
        let model_transform_back_wall_right = model_transform.times(Mat4.translation(30, 11, -15.6))
            .times(Mat4.scale(10, 20, 0.7));
        let model_transform_back_wall_bottom = model_transform.times(Mat4.translation(0, -4, -15.6))
            .times(Mat4.scale(20, 5, 0.7));
        let model_transform_back_wall_left = model_transform.times(Mat4.translation(-30, 11, -15.6))
            .times(Mat4.scale(10, 20, 0.7));

         // Computer
         let model_transform_screen = model_transform.times(Mat4.rotation(Math.PI / 4, 0,-1,0))
             .times(Mat4.translation(0, 2.3, -2.8))
             .times(Mat4.scale(0.2,2,3));
         let model_transform_monitor_back = model_transform.times(Mat4.rotation(Math.PI / 4, 0,-1,0))
             .times(Mat4.translation(-0.4, 2.3, -2.8))
             .times(Mat4.scale(0.3,2.1,3));
         let model_transform_monitor_stand = model_transform.times(Mat4.rotation(Math.PI / 4, 0,-1,0))
             .times(Mat4.translation(-0.2, -1, -2.8))
             .times(Mat4.scale(0.2,1.2,0.5));
         let model_transform_monitor_base = model_transform.times(Mat4.rotation(Math.PI / 2, 1,0,0))
             .times(Mat4.rotation(Math.PI / 4, 0,0,1))
             .times(Mat4.translation(-0.4, -3, 1.99))
             .times(Mat4.scale(2,2.6,10));
         let model_transform_monitor_left = model_transform.times(Mat4.rotation(Math.PI / 4, 0,-1,0))
             .times(Mat4.translation(-0.23, 2.35, 0.4 ))
             .times(Mat4.scale(0.45,2.1,0.2));
         let model_transform_monitor_right = model_transform.times(Mat4.rotation(Math.PI / 4, 0,-1,0))
             .times(Mat4.translation(-0.23, 2.35, -6 ))
             .times(Mat4.scale(0.45,2.1,0.2));
         let model_transform_monitor_above = model_transform.times(Mat4.rotation(Math.PI / 4, 0,-1,0))
             .times(Mat4.translation(-0.2, 4.5, -2.8))
             .times(Mat4.scale(0.45,0.2,3.425));
         let model_transform_monitor_below = model_transform.times(Mat4.rotation(Math.PI / 4, 0,-1,0))
             .times(Mat4.translation(-0.2, 0.1, -2.8))
             .times(Mat4.scale(0.45,0.2,3.425));

        // Painting 1 & 2
        let painting_1_model_transform = model_transform.times(Mat4.translation(27,8,-14.89))
            .times(Mat4.scale(6,8,1,0));
        let painting_2_model_transform = model_transform.times(Mat4.translation(-34,6,-14.89))
            .times(Mat4.scale(8,10,1,0));

        this.shapes.square_2d.draw(context, program_state, painting_1_model_transform, this.painting_1);
        this.shapes.square_2d.draw(context, program_state, painting_2_model_transform, this.painting_2);

        // Notebook
        let model_transform_notebook_left = model_transform.times(Mat4.rotation(Math.PI * 4 / 9, 1,0,0))
            .times(Mat4.translation(2.5, 1, 1.8))
            .times(Mat4.scale(0.8,1,0.1));
        let model_transform_notebook_left_cover = model_transform.times(Mat4.rotation(Math.PI * 4 / 9, 1,0,0))
            .times(Mat4.translation(2.5, 1, 2))
            .times(Mat4.scale(0.9,1,0.1));
        let model_transform_notebook_middle = model_transform.times(Mat4.translation(2.5, -1.9, 0.3))
            .times(Mat4.scale(0.9,0.15,0.1));
        let model_transform_notebook_right = model_transform.times(Mat4.translation(2.5, -1.75, -0.7))
            .times(Mat4.scale(0.8,0.1,1));
        let model_transform_notebook_right_cover = model_transform.times(Mat4.translation(2.5, -1.95, -0.7))
            .times(Mat4.scale(0.9,0.1,1));

        // Rug
        let model_transform_rug = model_transform.times(Mat4.translation(1, -9, -3))
            .times(Mat4.scale(20,0.01,9));
        this.shapes.cube.draw(context, program_state, model_transform_rug, this.rug);

        // Bed
        let model_transform_bed_rod_fr = model_transform.times(Mat4.rotation(Math.PI / 2, 1, 0,0))
            .times(Mat4.translation(-20, -10 ,2))
            .times(Mat4.scale(0.5, 0.5, 15));
        let model_transform_bed_rod_fl = model_transform.times(Mat4.rotation(Math.PI / 2, 1, 0,0))
            .times(Mat4.translation(-38, -10 ,2))
            .times(Mat4.scale(0.5, 0.5, 15));
        let model_transform_bed_rod_br = model_transform.times(Mat4.rotation(Math.PI / 2, 1, 0,0))
            .times(Mat4.translation(-20, 10 ,5))
            .times(Mat4.scale(0.5, 0.5, 8));
        let model_transform_bed_rod_bl = model_transform.times(Mat4.rotation(Math.PI / 2, 1, 0,0))
            .times(Mat4.translation(-38, 10 ,5))
            .times(Mat4.scale(0.5, 0.5, 8));
        let model_transform_bed = model_transform.times(Mat4.translation(-29, -4 ,0))
            .times(Mat4.scale(9, 2.5, 10));
        let model_transform_bed_headboard = model_transform.times(Mat4.translation(-29, 2 ,-10))
            .times(Mat4.scale(9, 2.5, 0.5));
        let model_transform_bed_front = model_transform.times(Mat4.translation(-29, -5 ,10))
            .times(Mat4.scale(9, 2.5, 0.5));
        let model_transform_bed_back = model_transform.times(Mat4.translation(-29, -5 ,-10))
            .times(Mat4.scale(9, 2.5, 0.5));
        let model_transform_bed_right = model_transform.times(Mat4.translation(-20, -5 ,0))
            .times(Mat4.scale(0.5, 1.5, 10));
        let model_transform_bed_left = model_transform.times(Mat4.translation(-38, -5 ,0))
            .times(Mat4.scale(0.5, 1.5, 10));
        let model_transform_bed_ball_bl = model_transform.times(Mat4.translation(-38, 6.125 ,-10))
            .times(Mat4.scale(0.75, 0.75, 0.75));
        let model_transform_bed_ball_br = model_transform.times(Mat4.translation(-20, 6.125 ,-10))
            .times(Mat4.scale(0.75, 0.75, 0.75));
        let model_transform_bed_ball_fl = model_transform.times(Mat4.translation(-38, -0.375 ,10))
            .times(Mat4.scale(0.75, 0.75, 0.75));
        let model_transform_bed_ball_fr = model_transform.times(Mat4.translation(-20, -0.375 ,10))
            .times(Mat4.scale(0.75, 0.75, 0.75));
        let model_transform_pillow = model_transform.times(Mat4.translation(-29, -0.75 ,-5))
            .times(Mat4.scale(5, 0.75, 3));

        // Shelf 1
        let shelf_1_model_transform = model_transform.times(Mat4.translation(30, 3.5, -12.4))
            .times(Mat4.scale(8,0.5,2.5));
        let shelf_back_model_transform = model_transform.times(Mat4.translation(30, -2, -14.6))
            .times(Mat4.scale(8,6.05,0.3));
        let shelf_side_model_transform = model_transform.times(Mat4.translation(22, -2.5, -12.4))
        .times(Mat4.scale(0.3,6.55,2.55));


        this.shapes.cube.draw(context, program_state, shelf_1_model_transform, shadow_pass? this.wood : this.pure);
        this.shapes.cube.draw(context, program_state, shelf_1_model_transform.times(Mat4.translation(0,-8,0)), shadow_pass? this.wood : this.pure);
        this.shapes.cube.draw(context, program_state, shelf_1_model_transform.times(Mat4.translation(0,-16,0)), shadow_pass? this.wood : this.pure);
        this.shapes.cube.draw(context, program_state, shelf_1_model_transform.times(Mat4.translation(0,-24,0)), shadow_pass? this.wood : this.pure);
        this.shapes.cube.draw(context, program_state, shelf_back_model_transform, shadow_pass? this.wood.override({color: color(0.88,0.43,0.38,1)}) : this.pure);
        this.shapes.cube.draw(context, program_state, shelf_side_model_transform, shadow_pass? this.wood.override({color: color(0.88,0.43,0.38,1)}) : this.pure);
        this.shapes.cube.draw(context, program_state, shelf_side_model_transform.times(Mat4.translation(53.5,0,0)), shadow_pass? this.wood.override({color: color(0.88,0.43,0.38,1)}) : this.pure);
        // End Shelf 1

        this.shapes.cube.draw(context, program_state, model_transform_floor, shadow_pass? this.flooring : this.pure);
        this.shapes.cube.draw(context, program_state, model_transform_ceiling, shadow_pass? this.wall : this.pure);
        this.shapes.cube.draw(context, program_state, model_transform_left_wall, shadow_pass? this.wall : this.pure);
        this.shapes.cube.draw(context, program_state, model_transform_right_wall, shadow_pass? this.wall : this.pure);
        this.shapes.cube.draw(context, program_state, model_transform_front_wall, shadow_pass? this.wall : this.pure);
        this.shapes.cube.draw(context, program_state, model_transform_back_wall_top, shadow_pass? this.wall : this.pure);
        this.shapes.cube.draw(context, program_state, model_transform_back_wall_right, shadow_pass? this.wall : this.pure);
        this.shapes.cube.draw(context, program_state, model_transform_back_wall_bottom, shadow_pass? this.wall : this.pure);
        this.shapes.cube.draw(context, program_state, model_transform_back_wall_left, shadow_pass? this.wall : this.pure);

        this.shapes.cube.draw(context, program_state, model_transform_background, this.wood.override({color: background_color, ambient: 0.7}))

        if(this.toggle.table) {
            this.shapes.cube.draw(context, program_state, model_transform_counter, shadow_pass? this.wood : this.pure);
            this.shapes.cube.draw(context, program_state, model_transform_leg, shadow_pass? this.wood : this.pure);
            this.shapes.cube.draw(context, program_state, model_transform_leg.times(Mat4.translation(-10,0,0)), shadow_pass? this.wood : this.pure);
            this.shapes.cube.draw(context, program_state, model_transform_leg.times(Mat4.translation(0,0,-10)), shadow_pass? this.wood : this.pure);
            this.shapes.cube.draw(context, program_state, model_transform_leg.times(Mat4.translation(-10,0,-10)), shadow_pass? this.wood : this.pure);
        }

        if(this.toggle.chair) {
            this.shapes.cube.draw(context, program_state, model_transform_ch_leg, shadow_pass? this.wood : this.pure);
            this.shapes.cube.draw(context, program_state, model_transform_ch_leg.times(Mat4.translation(-6, 0, 0)), shadow_pass? this.wood : this.pure);
            this.shapes.cube.draw(context, program_state, model_transform_ch_leg.times(Mat4.translation(0, 0, -6)), shadow_pass? this.wood : this.pure);
            this.shapes.cube.draw(context, program_state, model_transform_ch_leg.times(Mat4.translation(-6, 0, -6)), shadow_pass? this.wood : this.pure);
            this.shapes.cube.draw(context, program_state, model_transform_seat, shadow_pass? this.wood : this.pure);
            this.shapes.cube.draw(context, program_state, model_transform_back, shadow_pass? this.wood : this.pure);
            this.shapes.cube.draw(context, program_state, model_transform_arm, shadow_pass? this.wood : this.pure);
            this.shapes.cube.draw(context, program_state, model_transform_arm.times(Mat4.translation(0,0,-18)), shadow_pass? this.wood : this.pure);
            this.shapes.cube.draw(context, program_state, model_transform_armrest, shadow_pass? this.wood : this.pure);
            this.shapes.cube.draw(context, program_state, model_transform_armrest.times(Mat4.translation(0,0,-18)), shadow_pass? this.wood : this.pure);
        }

        if(this.toggle.book) {
            this.shapes.cube.draw(context, program_state, model_transform_book1, shadow_pass? this.book_filling : this.pure);
            this.shapes.cube.draw(context, program_state, model_transform_book1_bottom, shadow_pass? this.book_1_cover : this.pure);
            this.shapes.cube.draw(context, program_state, model_transform_book1_top, shadow_pass? this.book_1_cover : this.pure);
            this.shapes.cube.draw(context, program_state, model_transform_book1_binding, shadow_pass? this.book_1_cover : this.pure);
        }

        if(this.toggle.mug) {
             this.shapes.cup.draw(context, program_state, mug_model_transform, shadow_pass? this.ceramic : this.pure);
             this.shapes.circle.draw(context, program_state, mug_base_model_transform, shadow_pass? this.ceramic : this.pure);
        }

        if(this.toggle.computer) {
             this.shapes.comps.draw(context, program_state, model_transform_screen, this.screen);
             this.shapes.cube.draw(context, program_state, model_transform_monitor_back, shadow_pass ? this.bmetal : this.pure);
             this.shapes.cube.draw(context, program_state, model_transform_monitor_left, shadow_pass ? this.bmetal : this.pure);
             this.shapes.cube.draw(context, program_state, model_transform_monitor_right, shadow_pass ? this.bmetal : this.pure);
             this.shapes.cube.draw(context, program_state, model_transform_monitor_above, shadow_pass ? this.bmetal : this.pure);
             this.shapes.cube.draw(context, program_state, model_transform_monitor_below, shadow_pass ? this.bmetal : this.pure);
             this.shapes.cube.draw(context, program_state, model_transform_monitor_stand, shadow_pass ? this.bmetal : this.pure);
             this.shapes.circle.draw(context,program_state,model_transform_monitor_base, shadow_pass ? this.bmetal : this.pure);
        }

        if(this.toggle.notebook){
            this.shapes.cube.draw(context, program_state, model_transform_notebook_left, shadow_pass? this.book_filling : this.pure);
            this.shapes.cube.draw(context, program_state, model_transform_notebook_left_cover,
                shadow_pass? this.book_filling.override({color: color(0.1647,0.3216,0.7451,1)}) : this.pure);
            this.shapes.cube.draw(context, program_state, model_transform_notebook_middle,
                shadow_pass? this.book_filling.override({color: color(0.1647,0.3216,0.7451,1)}) : this.pure);
            this.shapes.cube.draw(context, program_state, model_transform_notebook_right, shadow_pass? this.book_filling : this.pure);
            this.shapes.cube.draw(context, program_state, model_transform_notebook_right_cover,
                shadow_pass? this.book_filling.override({color: color(0.1647,0.3216,0.7451,1)}) : this.pure);
        }

        if(this.toggle.bed) {
            this.shapes.cup.draw(context, program_state, model_transform_bed_rod_fr, shadow_pass? this.wood : this.pure);
            this.shapes.cup.draw(context, program_state, model_transform_bed_rod_fl, shadow_pass? this.wood : this.pure);
            this.shapes.cup.draw(context, program_state, model_transform_bed_rod_br, shadow_pass? this.wood : this.pure);
            this.shapes.cup.draw(context, program_state, model_transform_bed_rod_bl, shadow_pass? this.wood : this.pure);
            this.shapes.cube.draw(context, program_state, model_transform_bed, shadow_pass? this.bed : this.pure);
            this.shapes.cube.draw(context, program_state, model_transform_bed_headboard, shadow_pass? this.wood : this.pure);
            this.shapes.cube.draw(context, program_state, model_transform_bed_back, shadow_pass? this.wood : this.pure);
            this.shapes.cube.draw(context, program_state, model_transform_bed_front, shadow_pass? this.wood : this.pure);
            this.shapes.cube.draw(context, program_state, model_transform_bed_right, shadow_pass? this.wood : this.pure);
            this.shapes.cube.draw(context, program_state, model_transform_bed_left, shadow_pass? this.wood : this.pure);
            this.shapes.sphere4.draw(context, program_state, model_transform_bed_ball_fr, shadow_pass? this.wood : this.pure);
            this.shapes.sphere4.draw(context, program_state, model_transform_bed_ball_fl, shadow_pass? this.wood : this.pure);
            this.shapes.sphere4.draw(context, program_state, model_transform_bed_ball_br, shadow_pass? this.wood : this.pure);
            this.shapes.sphere4.draw(context, program_state, model_transform_bed_ball_bl, shadow_pass? this.wood : this.pure);
            this.shapes.cube.draw(context, program_state, model_transform_pillow, shadow_pass? this.pillow : this.pure);
        }

        // -------------------------------------------------

        
    }

    display(context, program_state) {
        let t;
        if (this.toggle.time) {
            if(this.first_entry) {
                this.first_entry = false;
                this.lapsed_time = program_state.animation_time / 1000 - this.old_time
            }
            t = program_state.animation_time / 1000 - this.lapsed_time;
        }
        else {
            if(this.first_entry) {
                this.first_entry = false;
                this.old_time = program_state.animation_time / 1000 - this.lapsed_time;
            }
            t = this.old_time;
        }
        if (this.first_set) {
            this.first_set = false;
            if(this.toggle.noon) {
                this.time_adjust = t - this.noon;
                this.toggle.noon = false;
            }
            if(this.toggle.midnight) {
                this.time_adjust = t - this.midnight;
                this.toggle.midnight = false;
            }
        }
        t = t - this.time_adjust
        const gl = context.context;

        if (!this.init_ok) {
            const ext = gl.getExtension('WEBGL_depth_texture');
            if (!ext) {
                return alert('need WEBGL_depth_texture');  // eslint-disable-line
            }
            this.texture_buffer_init(gl);

            this.init_ok = true;
        }

        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        // ----------------------------------------------------------------------------------------
        const light_rotation_matrix = Mat4.rotation(t, 0, 0, 1);
        const light_position = light_rotation_matrix.times(vec4(20, 6, -22, 1));
        this.light_position = light_position;
        // ----------------------------------------------------------------------------------------
        
        const sun_radius = 2 + Math.sin(2 * Math.PI * t / 10000);
        this.light_color = color(1, (sun_radius / 2 - 0.5), (sun_radius / 2 - 0.5), 1);

        // This is a rough target of the light.
        // Although the light is point light, we need a target to set the POV of the light
        this.light_view_target = vec4(0, 0, 0, 1);
        this.light_field_of_view = 130 * Math.PI / 180; // 130 degree

        program_state.lights = [new Light(this.light_position, this.light_color, 1000)];

        // Step 1: set the perspective and camera to the POV of light
        const light_view_mat = Mat4.look_at(
            vec3(this.light_position[0], this.light_position[1], this.light_position[2]),
            vec3(this.light_view_target[0], this.light_view_target[1], this.light_view_target[2]),
            vec3(0, 1, 0), // assume the light to target will have a up dir of +y, maybe need to change according to your case
        );
        const light_proj_mat = Mat4.perspective(this.light_field_of_view, 1, 0.5, 500);
        // Bind the Depth Texture Buffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightDepthFramebuffer);
        gl.viewport(0, 0, this.lightDepthTextureSize, this.lightDepthTextureSize);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // Prepare uniforms
        program_state.light_view_mat = light_view_mat;
        program_state.light_proj_mat = light_proj_mat;
        program_state.light_tex_mat = light_proj_mat;
        program_state.view_mat = light_view_mat;
        program_state.projection_transform = light_proj_mat;
        this.render_scene(context, program_state, false,false, false);

        // Step 2: unbind, draw to the canvas
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        program_state.view_mat = program_state.camera_inverse;
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 0.5, 500);
        this.render_scene(context, program_state, true,true, true);

        // ------------------------

        this.light_pov = light_view_mat.times(Mat4.translation(0,0,-4));

        // setting the camera
        if (this.attached) {
            if (this.attached() == this.initial_camera_location) {
                let smoothed = this.initial_camera_location.map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.1));
                program_state.set_camera(smoothed);
            }
            else {
                let desired = this.attached();
                let smoothed = desired.map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.1));
                program_state.set_camera(smoothed);

            }
        }
   
        // ----------------------------
    }

    // show_explanation(document_element) {
    //     document_element.innerHTML += "<p>This demo loads an external 3D model file of a teapot.  It uses a condensed version of the \"webgl-obj-loader.js\" "
    //         + "open source library, though this version is not guaranteed to be complete and may not handle some .OBJ files.  It is contained in the class \"Shape_From_File\". "
    //         + "</p><p>One of these teapots is lit with bump mapping.  Can you tell which one?</p>";
    // }
}

